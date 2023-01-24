import { concatMap, withLatestFrom } from 'rxjs/operators';
import { sample } from 'lodash';
import { Observable } from 'rxjs';
import { ProcessControlRequestAction, SpawnProcessRequest } from '../../routing/process-control-router';
import { RequestCategory } from '../../routing/types/request-category';
import { DistributedOperatorFacade } from '../../facades/distributed-operator-facade';
import { SimpleInMemoryKeyValueConfiguration } from './simple-in-memory-key-value-configuration';
import { SimpleInMemoryKeyValueInternalConfiguration } from './simple-in-memory-key-value-internal-configuration';
import { AllComponentConfigurations } from '../scaffolding/all-component-configurations';
import { ComponentName } from '../scaffolding/component-name';

export const simpleInMemoryKeyValueDistributedOperatorFacade: DistributedOperatorFacade<SimpleInMemoryKeyValueConfiguration> = {
  distributedOperatorFunction: (
    { nodes$, metadataDispatcher, rpcInterface },
    { events$, path },
  ): Observable<void> => {
    return events$.pipe(
      withLatestFrom(nodes$),
      concatMap(async ([config, nodes]) => {
        // Fetch the internal config
        const internalConfigPath = [...path, 'internal'];
        let internalConfig: AllComponentConfigurations | undefined = await metadataDispatcher.getEntry(internalConfigPath);

        // Create it if it doesn't exist
        if (!internalConfig) {
          internalConfig = new SimpleInMemoryKeyValueInternalConfiguration(undefined);
          await metadataDispatcher.putEntry(internalConfigPath, internalConfig);
        }

        // Throw an error if it has the wrong type
        if (internalConfig.NAME !== ComponentName.SimpleMemoryKeyValueInternal) {
          console.error('Simple memory key value datastore has the wrong internal config type');
          return;
        }

        // Spawn the remote process
        if (!internalConfig.remoteProcess) {
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
            payload: { processClass: 'SimpleMemoryKeyValueDatastore' },
          }
          const newProcessId = await rpcInterface.makeRequest(spawnProcessRequest);
          if (typeof newProcessId !== 'string') {
            throw new Error(`Received invalid response from spawn processes request. Expected: string, received: ${newProcessId}`);
          }

          internalConfig = new SimpleInMemoryKeyValueInternalConfiguration({ nodeId: chosenNode, processId: newProcessId });
          await metadataDispatcher.putEntry(internalConfigPath, internalConfig);
        }
      }),
    );
  },
};
