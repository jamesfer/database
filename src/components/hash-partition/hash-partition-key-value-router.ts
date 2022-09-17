import {
  KeyValueProcessAction,
  KeyValueProcessDropRequest,
  KeyValueProcessGetRequest,
  KeyValueProcessPutRequest
} from '../../routing/requests/key-value-node-request';
import { RequestCategory } from '../../routing/types/request-category';
import { RequestRouter } from '../../routing/types/request-router';
import { KeyValueConfigAction, KeyValueConfigRequest } from '../../routing/requests/key-value-config-request';
import { RPCInterface } from '../../types/rpc-interface';
import { AnyRequest } from '../../routing/all-request-router';
import { MetadataDispatcherFacade } from '../../facades/metadata-dispatcher-facade';
import { assertNever } from '../../utils/assert-never';
import { ProcessActionGroupName } from '../../routing/requests/base-process-action-request';
import { ConfigEntryName } from '../../config/config-entry-name';
import { FullyQualifiedPath } from '../../config/config';
import { HashPartitionEntry } from './hash-partition-entry';
import { findHashPartition } from './utils/hash';
import { HashPartitionDetails } from './hash-partition-internal-entry';

export function hashPartitionKeyValueRouter(
  rpcInterface: RPCInterface<AnyRequest>,
  metadataDispatcher: MetadataDispatcherFacade,
): (path: FullyQualifiedPath, config: HashPartitionEntry) => RequestRouter<KeyValueConfigRequest> {
  return (path, config) => async (request) => {
    // Look up internal config
    const internalPath = [...path, 'internal'];
    const internalConfig = await metadataDispatcher.getEntryAs(internalPath, ConfigEntryName.HashPartitionInternal);
    if (!internalConfig) {
      throw new Error('HashPartition internal config does not exist');
    }

    // Find the partition the key belongs to
    const partitionIndex = findHashPartition(request.key, config.partitionsCount);
    const partitionDetails: HashPartitionDetails | undefined = internalConfig.partitions[partitionIndex];
    if (!partitionDetails) {
      throw new Error('HashPartition partition at index ' + partitionIndex + ' is not ready yet');
    }

    switch (request.action) {
      case KeyValueConfigAction.Get: {
        const processRequest: KeyValueProcessGetRequest = {
          category: RequestCategory.ProcessAction,
          group: ProcessActionGroupName.KeyValue,
          action: KeyValueProcessAction.Get,
          targetNodeId: partitionDetails.nodeId,
          targetProcessId: partitionDetails.processId,
          key: request.key,
        };
        return rpcInterface.makeRequest(processRequest);
      }

      case KeyValueConfigAction.Put: {
        const processRequest: KeyValueProcessPutRequest = {
          category: RequestCategory.ProcessAction,
          group: ProcessActionGroupName.KeyValue,
          action: KeyValueProcessAction.Put,
          targetNodeId: partitionDetails.nodeId,
          targetProcessId: partitionDetails.processId,
          key: request.key,
          value: request.value,
        };
        await rpcInterface.makeRequest(processRequest);
        break;
      }

      case KeyValueConfigAction.Drop: {
        const processRequest: KeyValueProcessDropRequest = {
          category: RequestCategory.ProcessAction,
          group: ProcessActionGroupName.KeyValue,
          action: KeyValueProcessAction.Drop,
          targetNodeId: partitionDetails.nodeId,
          targetProcessId: partitionDetails.processId,
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
