import { RequestRouter } from '../../types/request-router';
import {
  MetadataTemporaryAction,
  MetadataTemporaryRequest
} from './metadata-temporary-request';
import { MetadataManager } from '../../../core/metadata-state/metadata-manager';
import { MetadataDispatcher } from '../../../core/metadata-state/metadata-dispatcher';
import { FullyQualifiedPath } from '../../../core/metadata-state/config';
import { DistributedCommitLogFactory } from '../../../types/distributed-commit-log-factory';
import { ProcessManager } from '../../../core/process-manager';
import { RpcInterface } from '../../../rpc/rpc-interface';
import { Observable } from 'rxjs';
import { assertNever } from '../../../utils/assert-never';
import { assert } from '../../../utils/assert';
import { AnyRequest } from '../any-request';
import {
  AnyComponentConfiguration,
  AnyComponentImplementations
} from '../../../components/any-component-configuration';
import { parse, stringify } from 'fp-ts/Json';

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

/**
 * This router handles the Put and Get requests on metadata entries themselves.
 * It is designed to be temporary and will eventually be replaced by something else.
 */
export function makeMetadataTemporaryRouter(
  nodeId: string,
  metadataManager: MetadataManager,
  distributedCommitLogFactory: DistributedCommitLogFactory<AnyComponentConfiguration>,
  processManager: ProcessManager,
  rpcInterface: RpcInterface<AnyRequest>,
  nodes$: Observable<string[]>,
): RequestRouter<MetadataTemporaryRequest> {
  return async (request) => {
    switch (request.action) {
      case MetadataTemporaryAction.Get: {
        const entry = await getMetadataDispatcher(metadataManager, request.path).getEntry(request.path);
        if (!entry) {
          return '';
        }

        const json = AnyComponentImplementations.serialize(entry);
        return stringify(json);
      }

      case MetadataTemporaryAction.Put: {
        const json = parse(request.entry);
        assert(json._tag === 'Right', `Failed to parse json: ${request.entry}`);

        const config = AnyComponentImplementations.deserialize(json.right);
        await getMetadataDispatcher(metadataManager, request.path).putEntry(request.path, config);
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
