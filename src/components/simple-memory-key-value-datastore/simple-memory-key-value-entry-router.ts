import {
  KeyValueProcessAction,
  KeyValueProcessDropRequest,
  KeyValueProcessGetRequest,
  KeyValueProcessPutRequest
} from '../../routing/requests/key-value-node-request';
import { RequestCategory } from '../../routing/types/request-category';
import { RequestRouter } from '../../routing/types/request-router';
import { KeyValueConfigAddressedRequestAction, KeyValueConfigAddressedRequest } from '../../routing/requests/key-value-config-addressed-request';
import { RPCInterface } from '../../types/rpc-interface';
import { AnyRequest } from '../../routing/all-request-router';
import { MetadataDispatcherFacade } from '../../facades/metadata-dispatcher-facade';
import { SimpleMemoryKeyValueEntry } from './simple-memory-key-value-entry';
import { assertNever } from '../../utils/assert-never';
import { ProcessAddressedGroupName } from '../../routing/requests/process-targeting/base-process-addressed-request';
import { ConfigEntryName } from '../../config/config-entry-name';
import { FullyQualifiedPath } from '../../config/config';

export function simpleMemoryKeyValueEntryRouter(
  rpcInterface: RPCInterface<AnyRequest>,
  metadataDispatcher: MetadataDispatcherFacade,
): (path: FullyQualifiedPath, config: SimpleMemoryKeyValueEntry) => RequestRouter<KeyValueConfigAddressedRequest> {
  return (path, config) => async (request) => {
    // Look up internal config
    const internalPath = [...path, 'internal'];
    const internalConfig = await metadataDispatcher.getEntryAs(internalPath, ConfigEntryName.SimpleMemoryKeyValueInternal);
    if (!internalConfig) {
      throw new Error('SimpleMemoryKeyValue internal config does not exist');
    }

    if (!internalConfig.remoteProcess) {
      throw new Error('SimpleMemoryKeyValue remote process is not ready yet');
    }

    switch (request.action) {
      case KeyValueConfigAddressedRequestAction.Get: {
        const processRequest: KeyValueProcessGetRequest = {
          category: RequestCategory.ProcessAction,
          group: ProcessAddressedGroupName.KeyValue,
          action: KeyValueProcessAction.Get,
          targetNodeId: internalConfig.remoteProcess.nodeId,
          targetProcessId: internalConfig.remoteProcess.processId,
          key: request.key,
        };
        return rpcInterface.makeRequest(processRequest);
      }

      case KeyValueConfigAddressedRequestAction.Put: {
        const processRequest: KeyValueProcessPutRequest = {
          category: RequestCategory.ProcessAction,
          group: ProcessAddressedGroupName.KeyValue,
          action: KeyValueProcessAction.Put,
          targetNodeId: internalConfig.remoteProcess.nodeId,
          targetProcessId: internalConfig.remoteProcess.processId,
          key: request.key,
          value: request.value,
        };
        await rpcInterface.makeRequest(processRequest);
        break;
      }

      case KeyValueConfigAddressedRequestAction.Drop: {
        const processRequest: KeyValueProcessDropRequest = {
          category: RequestCategory.ProcessAction,
          group: ProcessAddressedGroupName.KeyValue,
          action: KeyValueProcessAction.Drop,
          targetNodeId: internalConfig.remoteProcess.nodeId,
          targetProcessId: internalConfig.remoteProcess.processId,
          key: request.key,
        };
        await rpcInterface.makeRequest(processRequest);
        break;
      }

      default:
        assertNever(request);
    }
  };
}
