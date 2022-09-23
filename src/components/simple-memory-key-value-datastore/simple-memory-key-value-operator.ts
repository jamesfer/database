import { concatMap, withLatestFrom } from 'rxjs/operators';
import { ProcessManager } from '../../core/process-manager';
import { sample } from 'lodash';
import { Observable } from 'rxjs';
import { ComponentOperator } from '../scaffolding/component-operator';
import { RpcInterface } from '../../types/rpc-interface';
import { AnyRequest } from '../../routing/all-request-router';
import { ProcessControlRequestAction, SpawnProcessRequest } from '../../routing/process-control-router';
import { RequestCategory } from '../../routing/types/request-category';
import { SimpleMemoryKeyValueInternalEntry } from './simple-memory-key-value-internal-entry';
import { ConfigEntryName } from '../../config/config-entry-name';
import { ConfigEntry } from '../../config/config-entry';
import { MetadataDispatcherInterface } from '../../types/metadata-dispatcher-interface';

export const simpleMemoryKeyValueOperator = (
  processManager: ProcessManager,
  metadataDispatcher: MetadataDispatcherInterface,
  rpcInterface: RpcInterface<AnyRequest>,
  nodes$: Observable<string[]>,
): ComponentOperator<ConfigEntryName.SimpleMemoryKeyValue> => ({ path, events$ }) => {
  return events$.pipe(
    withLatestFrom(nodes$),
    concatMap(async ([config, nodes]) => {
      // Fetch the internal config
      const internalConfigPath = [...path, 'internal'];
      let internalConfig: ConfigEntry | undefined = await metadataDispatcher.getEntry(internalConfigPath);

      // Create it if it doesn't exist
      if (!internalConfig) {
        internalConfig = new SimpleMemoryKeyValueInternalEntry(undefined);
        await metadataDispatcher.putEntry(internalConfigPath, internalConfig);
      }

      // Throw an error if it has the wrong type
      if (internalConfig.name !== ConfigEntryName.SimpleMemoryKeyValueInternal) {
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

        internalConfig = new SimpleMemoryKeyValueInternalEntry({ nodeId: chosenNode, processId: newProcessId });
        await metadataDispatcher.putEntry(internalConfigPath, internalConfig);
      }
    }),
  );
}
