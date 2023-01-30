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
import { ProcessManager } from '../core/process-manager';
import { RpcInterface } from '../rpc/rpc-interface';
import { AnyRequest } from './unified-request-router';
import { Observable } from 'rxjs';
import { assertNever } from '../utils/assert-never';
import { AllComponentsLookup, componentConfigurationImplements } from '../components/scaffolding/all-components-lookup';
import { SERIALIZABLE_FACADE_FLAG, SerializableFacade } from '../facades/serializable-facade';
import { assert } from '../utils/assert';
import { AllComponentConfigurations } from '../components/scaffolding/all-component-configurations';

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
  distributedCommitLogFactory: DistributedCommitLogFactory<AllComponentConfigurations>,
  processManager: ProcessManager,
  rpcInterface: RpcInterface<AnyRequest>,
  nodes$: Observable<string[]>,
): RequestRouter<MetadataTemporaryRequest> {
  const configEntryCodec = new ConfigEntryCodec();

  return async (request) => {
    switch (request.action) {
      case MetadataTemporaryAction.Get: {
        const entry = await getMetadataDispatcher(metadataManager, request.path).getEntry(request.path);
        if (!entry) {
          return '';
        }

        assert(
          componentConfigurationImplements([SERIALIZABLE_FACADE_FLAG], entry),
          `Cannot return ${entry.NAME} component as it does not implement the serializable facade`,
        );
        const serializer: SerializableFacade<AllComponentConfigurations> = AllComponentsLookup[entry.NAME].FACADES[SERIALIZABLE_FACADE_FLAG];
        return serializer.serialize(entry);
      }

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
