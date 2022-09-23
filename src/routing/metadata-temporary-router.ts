import { RequestRouter } from './types/request-router';
import {
  MetadataTemporaryAction,
  MetadataTemporaryRequest
} from './requests/metadata-temporary-request';
import { MetadataManager } from '../core/metadata-state/metadata-manager';
import { MetadataDispatcher } from '../core/metadata-state/metadata-dispatcher';
import { FullyQualifiedPath } from '../config/config';
import { ConfigEntryCodec } from '../core/commit-log/config-entry-codec';
import { DistributedCommitLogFactory } from '../types/distributed-commit-log-factory';
import { ConfigEntry } from '../config/config-entry';
import { ProcessManager } from '../core/process-manager';
import { RpcInterface } from '../types/rpc-interface';
import { AnyRequest } from './all-request-router';
import { Observable } from 'rxjs';
import { assertNever } from '../utils/assert-never';

function getMetadataDispatcher(
  metadataManager: MetadataManager,
  path: FullyQualifiedPath,
): MetadataDispatcher {
  // Find the matching metadata dispatcher
  const parentDispatcher = metadataManager.getClosestDispatcherMatching(path);
  if (!parentDispatcher || !parentDispatcher.containsPath(path)) {
    throw new Error(`Could not find parent dispatcher for entry at ${path.join('/')}`);
  }
  return parentDispatcher;
}

export function makeMetadataTemporaryRouter(
  nodeId: string,
  metadataManager: MetadataManager,
  distributedCommitLogFactory: DistributedCommitLogFactory<ConfigEntry>,
  processManager: ProcessManager,
  rpcInterface: RpcInterface<AnyRequest>,
  nodes$: Observable<string[]>,
): RequestRouter<MetadataTemporaryRequest> {
  const configEntryCodec = new ConfigEntryCodec();

  return async (request) => {
    switch (request.action) {
      case MetadataTemporaryAction.Get:
        return getMetadataDispatcher(metadataManager, request.path).getEntry(request.path);

      case MetadataTemporaryAction.Put: {
        const deserializedConfig = await configEntryCodec.deserialize(request.entry);
        if (!deserializedConfig) {
          throw new Error(`Could not deserialize config entry: ${request.entry}`);
        }
        await getMetadataDispatcher(metadataManager, request.path).putEntry(request.path, deserializedConfig);
        break;
      }

      case MetadataTemporaryAction.Bootstrap: {
        const distributedMetadata = await distributedCommitLogFactory.createDistributedCommitLog(nodeId);
        const metadataDispatcher = await MetadataDispatcher.initialize(
          nodeId,
          request.path,
          processManager,
          distributedMetadata,
          rpcInterface,
          nodes$,
        );
        metadataManager.registerDispatcher(request.path, metadataDispatcher);
        break;
      }

      default:
        return assertNever(request);
    }
  };
}
