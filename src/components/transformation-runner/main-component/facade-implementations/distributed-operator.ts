import {
  ConfigLifecycle,
  DistributedOperatorContext,
  DistributedOperatorFacade
} from '../../../../facades/distributed-operator-facade';
import { TransformationRunnerConfiguration } from '../transformation-runner-configuration';
import { Observable } from 'rxjs';
import { concatMap, withLatestFrom } from 'rxjs/operators';
import { AllComponentConfigurations } from '../../../scaffolding/all-component-configurations';
import { ComponentName } from '../../../scaffolding/component-name';
import {
  TransformationRunnerInternalConfiguration
} from '../../internal-component/transformation-runner-internal-configuration';
import { sample } from 'lodash';
import {
  ProcessControlRequestAction,
  SpawnProcessRequest
} from '../../../../routing/actions/process-control/process-control-request';
import { RequestCategory } from '../../../../routing/actions/request-category';
import { assert } from '../../../../utils/assert';

export const TransformationRunnerDistributedOperatorFacade: DistributedOperatorFacade<TransformationRunnerConfiguration> = {
  distributedOperatorFunction(
    { nodes$, metadataDispatcher, rpcInterface }: DistributedOperatorContext,
    { events$, path }: ConfigLifecycle<TransformationRunnerConfiguration>,
  ): Observable<void> {
    return events$.pipe(
      withLatestFrom(nodes$),
      concatMap(async ([config, nodes]) => {
        // Fetch the internal config
        const internalConfigPath = [...path, 'internal'];
        let internalConfig: AllComponentConfigurations | undefined = await metadataDispatcher.getEntry(internalConfigPath);

        // Create it, if it doesn't exist
        if (!internalConfig) {
          internalConfig = new TransformationRunnerInternalConfiguration(undefined);
          await metadataDispatcher.putEntry(internalConfigPath, internalConfig);
        }

        // Throw an error if it has the wrong type
        if (internalConfig.NAME !== ComponentName.TransformationRunnerInternal) {
          throw new Error('Transformation runner has the wrong internal config type');
        }

        // Spawn the remote process
        if (!internalConfig.remoteProcess) {
          // Pick a node
          const chosenNode: string | undefined = sample(nodes);
          assert(chosenNode, 'No nodes available to allocate a transformation runner process to');

          // Send a spawn process request
          const spawnProcessRequest: SpawnProcessRequest = {
            category: RequestCategory.ProcessControl,
            action: ProcessControlRequestAction.Spawn,
            targetNodeId: chosenNode,
            payload: { processClass: 'TransformationRunner' },
          }
          const newProcessId = await rpcInterface.makeRequest(spawnProcessRequest);
          assert(typeof newProcessId === 'string', `Received invalid response from spawn processes request. Expected: string, received: ${newProcessId}`);

          internalConfig = new TransformationRunnerInternalConfiguration({ nodeId: chosenNode, processId: newProcessId });
          await metadataDispatcher.putEntry(internalConfigPath, internalConfig);
        }
      }),
    );
  }
}
