import { DistributedOperatorFacade } from '../../../../facades/distributed-operator-facade';
import { HashPartitionConfiguration } from '../hash-partition-configuration';
import { Observable } from 'rxjs';
import { sample } from 'lodash';
import { RequestCategory } from '../../../../routing/actions/request-category';
import { concatMap, withLatestFrom } from 'rxjs/operators';
import { AllComponentConfigurations } from '../../../scaffolding/all-component-configurations';
import { HashPartitionDetails, HashPartitionInternalConfiguration } from '../../internal-component/hash-partition-internal-configuration';
import { ComponentName } from '../../../scaffolding/component-name';
import { RpcInterface } from '../../../../rpc/rpc-interface';
import { FullyQualifiedPath } from '../../../../core/metadata-state/config';
import { AllComponentsLookup } from '../../../scaffolding/all-components-lookup';
import { EQUALS_FACADE_NAME, EqualsFacade } from '../../../../facades/equals-facade';
import { assert } from '../../../../utils/assert';
import { AnyRequestResponse } from '../../../../routing/actions/any-request-response';
import { ProcessControlRequestAction, SpawnProcessRequest } from '../../../../routing/actions/process-control/process-control-request';

async function createNewPartitionProcess(
  nodes: string[],
  rpcInterface: RpcInterface<AnyRequestResponse>,
  parentPath: FullyQualifiedPath,
  partitionIndex: number,
): Promise<HashPartitionDetails> {
  // Pick a node
  const chosenNode: string | undefined = sample(nodes);
  if (!chosenNode) {
    throw new Error('No nodes available to allocate a key value datastore to');
  }

  // Send a spawn process request
  const spawnProcessRequest: SpawnProcessRequest = {
    category: RequestCategory.ProcessControl,
    action: ProcessControlRequestAction.Spawn,
    targetNodeId: chosenNode,
    payload: { processClass: 'HashPartition', parentPath, partitionIndex },
  }
  const newProcessId = await rpcInterface.makeRequest(spawnProcessRequest);
  if (typeof newProcessId !== 'string') {
    throw new Error(`Received invalid response from spawn processes request. Expected: string, received: ${newProcessId}`);
  }

  return { nodeId: chosenNode, processId: newProcessId };
}

function componentEquals(left: AllComponentConfigurations, right: AllComponentConfigurations): boolean {
  const equalsFacade: EqualsFacade<AllComponentConfigurations> | undefined = AllComponentsLookup[left.NAME].FACADES[EQUALS_FACADE_NAME];
  assert(equalsFacade, 'Component does not have an implementation of equals');
  assert(left.NAME === right.NAME, 'Cannot compare components of different types');
  return equalsFacade.equals(left, right);
}

export const hashPartitionDistributedOperatorFacade: DistributedOperatorFacade<HashPartitionConfiguration> = {
  distributedOperatorFunction(
    { nodes$, metadataDispatcher, rpcInterface },
    { events$, path },
  ): Observable<void> {
    return events$.pipe(
      withLatestFrom(nodes$),
      concatMap(async ([config, nodes]) => {
        // Fetch the internal config
        const internalConfigPath = [...path, 'internal'];
        let internalConfig: AllComponentConfigurations | undefined = await metadataDispatcher.getEntry(internalConfigPath);

        // Create it, if it doesn't exist
        if (!internalConfig) {
          internalConfig = new HashPartitionInternalConfiguration([]);
          await metadataDispatcher.putEntry(internalConfigPath, internalConfig);
        }

        // Throw an error if it has the wrong type
        if (internalConfig.NAME !== ComponentName.HashPartitionInternal) {
          throw new Error('Hash partition has the wrong internal config type');
        }

        // Check if any partitions need to be updated
        for (let i = 0; i < config.partitionsCount; i++) {
          if (!internalConfig.partitionDetails[i]) {
            const newPartitionDetails = await createNewPartitionProcess(
              nodes,
              rpcInterface,
              path,
              i,
            );

            internalConfig = new HashPartitionInternalConfiguration({
              ...internalConfig.partitionDetails,
              [i]: newPartitionDetails,
            });
            await metadataDispatcher.putEntry(internalConfigPath, internalConfig);
          }

          // Spawn the nested states
          const nestedConfigPath = [...internalConfigPath, `nested${i}`];
          const existingNestedConfig = await metadataDispatcher.getEntry(nestedConfigPath);
          if (!existingNestedConfig || !componentEquals(existingNestedConfig, config.nested.config)) {
            await metadataDispatcher.putEntry(nestedConfigPath, config.nested.config);
          }
        }
      }),
    );
  },
}
