import {
  KeyValueConfigRequestRouterContext,
  KeyValueConfigRequestRouterFacade
} from '../../../../facades/key-value-config-request-handler';
import { HashPartitionConfiguration } from '../hash-partition-configuration';
import { Response } from '../../../../routing/types/response';
import {
  KeyValueConfigAddressedRequest,
  KeyValueConfigAddressedRequestAction
} from '../../../../routing/requests/config-addressed/key-value-config-addressed-request';
import { findHashPartition } from '../../utils/hash';
import {
  KeyValueProcessAction,
  KeyValueProcessDropRequest,
  KeyValueProcessGetRequest,
  KeyValueProcessPutRequest
} from '../../../../routing/requests/process-addressed/key-value-process-addressed-request';
import { RequestCategory } from '../../../../routing/types/request-category';
import { ProcessAddressedGroupName } from '../../../../routing/requests/process-addressed/base-process-addressed-request';
import { assertNever } from '../../../../utils/assert-never';
import { ComponentName } from '../../../scaffolding/component-name';
import { assert } from '../../../../utils/assert';
import { HashPartitionDetails } from '../../internal-component/hash-partition-internal-configuration';

export const hashPartitionKeyValueRouter: KeyValueConfigRequestRouterFacade<HashPartitionConfiguration> = {
  async handleKeyValueConfigRequest(
    { rpcInterface, metadataManager }: KeyValueConfigRequestRouterContext,
    request: KeyValueConfigAddressedRequest,
    config: HashPartitionConfiguration,
  ): Promise<Response> {
    // Look up internal config
    const internalPath = [...request.target, 'internal'];
    const metadataDispatcher = await metadataManager.getClosestDispatcherMatching(internalPath);
    assert(metadataDispatcher, `Node does not have a MetadataDispatcher matching path: ${internalPath.join(', ')}`);

    const internalConfig = await metadataDispatcher.getEntryAs(internalPath, ComponentName.HashPartitionInternal);
    assert(internalConfig, 'HashPartition internal config does not exist');

    // Find the partition the key belongs to
    const partitionIndex = findHashPartition(request.key, config.partitionsCount);
    const partitionDetails: HashPartitionDetails | undefined = internalConfig.partitionDetails[partitionIndex];
    assert(partitionDetails, `HashPartition partition at index ${partitionIndex} is not ready yet`)

    switch (request.action) {
      case KeyValueConfigAddressedRequestAction.Get: {
        const processRequest: KeyValueProcessGetRequest = {
          category: RequestCategory.ProcessAction,
          group: ProcessAddressedGroupName.KeyValue,
          action: KeyValueProcessAction.Get,
          targetNodeId: partitionDetails.nodeId,
          targetProcessId: partitionDetails.processId,
          key: request.key,
        };
        return rpcInterface.makeRequest(processRequest);
      }

      case KeyValueConfigAddressedRequestAction.Put: {
        const processRequest: KeyValueProcessPutRequest = {
          category: RequestCategory.ProcessAction,
          group: ProcessAddressedGroupName.KeyValue,
          action: KeyValueProcessAction.Put,
          targetNodeId: partitionDetails.nodeId,
          targetProcessId: partitionDetails.processId,
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
  },
};
