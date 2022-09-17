import { concatMap, map, withLatestFrom } from 'rxjs/operators';
import { ProcessManager } from '../../core/process-manager';
import { range, sample } from 'lodash';
import { Observable } from 'rxjs';
import { MetadataDispatcherFacade } from '../../facades/metadata-dispatcher-facade';
import { ComponentOperator, ConfigLifecycle } from '../scaffolding/component-operator';
import { RPCInterface } from '../../types/rpc-interface';
import { AnyRequest } from '../../routing/all-request-router';
import { ProcessControlRequestAction, SpawnProcessRequest } from '../../routing/process-control-router';
import { RequestCategory } from '../../routing/types/request-category';
import { ConfigEntryName } from '../../config/config-entry-name';
import { ConfigEntry } from '../../config/config-entry';
import { HashPartitionInternalEntry } from './hash-partition-internal-entry';
import { ConfigFolder, ConfigFolderItem, FullyQualifiedPath } from '../../config/config';
import { dispatchConfigFolderChanges } from '../../core/metadata-state/utils/dispatch-config-folder-changes';
import { HashPartitionEntry } from './hash-partition-entry';
import { configEquals } from '../../config/config-equals';

// const updateNestedState = (
//   path: FullyQualifiedPath,
//   allComponentOperator: ComponentOperator<ConfigEntry['name']>,
// ) => (
//   config$: Observable<HashPartitionEntry>,
// ) => {
//   return config$.pipe(
//     map((config): ConfigFolder => {
//       const entries = range(config.partitionsCount)
//         .map((index): [number, ConfigFolderItem] => [
//           index,
//           new ConfigFolderItem(config.nestedConfig, new ConfigFolder({})),
//         ]);
//       return new ConfigFolder(Object.fromEntries(entries));
//     }),
//     dispatchConfigFolderChanges(path, allComponentOperator),
//   );
// }

async function updateState(
  metadataDispatcher: MetadataDispatcherFacade,
  rpcInterface: RPCInterface<AnyRequest>,
  path: FullyQualifiedPath,
  config: HashPartitionEntry,
  nodes: string[],
): Promise<void> {
  // Fetch the internal config
  const internalConfigPath = [...path, 'internal'];
  let internalConfig: ConfigEntry | undefined = await metadataDispatcher.getEntry(internalConfigPath);

  // Create it, if it doesn't exist
  if (!internalConfig) {
    internalConfig = new HashPartitionInternalEntry([]);
    await metadataDispatcher.putEntry(internalConfigPath, internalConfig);
  }

  // Throw an error if it has the wrong type
  if (internalConfig.name !== ConfigEntryName.HashPartitionInternal) {
    throw new Error('Hash partition has the wrong internal config type');
  }

  // Check if any partitions need to be updated
  for (let i = 0; i < config.partitionsCount; i++) {
    const partitionConfig = internalConfig.partitions[i];
    if (!partitionConfig) {
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
        payload: { processClass: 'HashPartition', parentPath: path, partitionIndex: i },
      }
      const newProcessId = await rpcInterface.makeRequest(spawnProcessRequest);
      if (typeof newProcessId !== 'string') {
        throw new Error(`Received invalid response from spawn processes request. Expected: string, received: ${newProcessId}`);
      }

      internalConfig = new HashPartitionInternalEntry({
        ...internalConfig.partitions,
        [i]: { nodeId: chosenNode, processId: newProcessId },
      });
      await metadataDispatcher.putEntry(internalConfigPath, internalConfig);

    }

    // Spawn the nested states
    const nestedConfigPath = [...internalConfigPath, `nested${i}`];
    const existingNestedConfig = await metadataDispatcher.getEntry(nestedConfigPath);
    if (!existingNestedConfig || !configEquals(existingNestedConfig, config.nestedConfig)) {
      await metadataDispatcher.putEntry(nestedConfigPath, config.nestedConfig);
    }
  }
}

export const hashPartitionOperator = (
  processManager: ProcessManager,
  metadataManager: MetadataDispatcherFacade,
  rpcInterface: RPCInterface<AnyRequest>,
  nodes$: Observable<string[]>,
  // allComponentOperator: ComponentOperator<ConfigEntry['name']>,
): ComponentOperator<ConfigEntryName.HashPartition> => ({ path, events$ }) => {
  return events$.pipe(
    withLatestFrom(nodes$),
    concatMap(async ([config, nodes]) => {
      await updateState(metadataManager, rpcInterface, path, config, nodes);
      // return config;
    }),
    // updateNestedState(path, allComponentOperator),
  );
}
