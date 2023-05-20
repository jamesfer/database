import {
  KeyValueConfigRequestRouterContext,
  KeyValueConfigRequestRouterFacade
} from '../../../../facades/key-value-config-request-handler';
import { HashPartitionConfiguration } from '../hash-partition-configuration';
import { Response } from '../../../../routing/types/response';
import {
  KeyValueConfigAddressedAction
} from '../../../../routing/actions/config-addressed/key-value/action';
import { findHashPartition } from '../../utils/hash';
import {
  KeyValueProcessAction,
  KeyValueProcessDropRequest,
  KeyValueProcessGetRequest,
  KeyValueProcessPutRequest
} from '../../../../routing/actions/process-addressed/key-value-process-addressed-request';
import { RequestCategory } from '../../../../routing/actions/request-category';
import { ProcessAddressedGroupName } from '../../../../routing/actions/process-addressed/base-process-addressed-request';
import { assertNever } from '../../../../utils/assert-never';
import { ComponentName } from '../../../scaffolding/component-name';
import { assert } from '../../../../utils/assert';
import { HashPartitionDetails } from '../../internal-component/hash-partition-internal-configuration';
import {
  KeyValueConfigAddressedRequestActionType
} from '../../../../routing/actions/config-addressed/key-value/base-request';

export const hashPartitionKeyValueRouter: KeyValueConfigRequestRouterFacade<HashPartitionConfiguration> = {
  async handleKeyValueConfigRequest(
    { rpcInterface, metadataManager }: KeyValueConfigRequestRouterContext,
    request: KeyValueConfigAddressedAction,
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
      case KeyValueConfigAddressedRequestActionType.Get: {
        const processRequest: KeyValueProcessGetRequest = {
          category: RequestCategory.Process,
          group: ProcessAddressedGroupName.KeyValue,
          action: KeyValueProcessAction.Get,
          targetNodeId: partitionDetails.nodeId,
          targetProcessId: partitionDetails.processId,
          key: request.key,
        };
        return rpcInterface.makeRequest(processRequest);
      }

      case KeyValueConfigAddressedRequestActionType.Put: {
        const processRequest: KeyValueProcessPutRequest = {
          category: RequestCategory.Process,
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

      case KeyValueConfigAddressedRequestActionType.Drop: {
        const processRequest: KeyValueProcessDropRequest = {
          category: RequestCategory.Process,
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
