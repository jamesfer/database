import { ConfigEntry, SimpleMemoryKeyValueInstanceEntry, SimpleMemoryKeyValueInternalEntry } from '../../types/config';
import { concatMap, withLatestFrom } from 'rxjs/operators';
import { ProcessManager } from '../../core/process-manager';
import { sample } from 'lodash';
import { Observable } from 'rxjs';
import { MetadataDispatcherFacade } from '../../facades/metadata-dispatcher-facade';
import { ComponentOperator } from '../component-operator';
import { RPCInterface } from '../../types/rpc-interface';
import { AnyRequest } from '../../core/routers/combined-router';
import { ProcessControlRequestAction, SpawnProcessRequest } from '../../core/routers/process-control-router';
import { RequestCategory } from '../../core/routers/scaffolding/request-category';
import { ConfigEntryName } from '../../config/scaffolding/config';

export const simpleMemoryKeyValueDatastoreOperator = (
  processManager: ProcessManager,
  metadataManager: MetadataDispatcherFacade,
  rpcInterface: RPCInterface<AnyRequest>,
  nodes$: Observable<string[]>,
): ComponentOperator<ConfigEntryName.SimpleMemoryKeyValue> => ({ events$ }) => {
  return events$.pipe(
    withLatestFrom(nodes$),
    concatMap(async ([config, nodes]) => {
      // Fetch the internal config
      const internalConfigPath = [...config.id, 'internal'];
      let internalConfig: ConfigEntry | undefined = await metadataManager.getEntry(internalConfigPath);

      // Create it if it doesn't exist
      if (!internalConfig) {
        internalConfig = new SimpleMemoryKeyValueInternalEntry(internalConfigPath, undefined);
        await metadataManager.putEntry(internalConfig);
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

        internalConfig = new SimpleMemoryKeyValueInternalEntry(internalConfigPath, { nodeId: chosenNode, processId: newProcessId });
        await metadataManager.putEntry(internalConfig);
      }
    }),
  );
}
