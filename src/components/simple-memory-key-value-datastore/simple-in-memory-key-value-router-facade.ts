import {
  KeyValueConfigAddressedAction
} from '../../routing/actions/config-addressed/key-value/action';
import {
  KeyValueProcessAction,
  KeyValueProcessDropRequest,
  KeyValueProcessGetRequest,
  KeyValueProcessPutRequest
} from '../../routing/actions/process-addressed/key-value-process-addressed-request';
import { RequestCategory } from '../../routing/actions/request-category';
import { ProcessAddressedGroupName } from '../../routing/actions/process-addressed/base-process-addressed-request';
import { assertNever } from '../../utils/assert-never';
import { SimpleInMemoryKeyValueConfiguration } from './simple-in-memory-key-value-configuration';
import {
  KeyValueConfigRequestRouterContext,
  KeyValueConfigRequestRouterFacade
} from '../../facades/key-value-config-request-handler';
import { Response } from '../../routing/types/response';
import { assert } from '../../utils/assert';
import { ComponentName } from '../scaffolding/component-name';
import {
  KeyValueConfigAddressedRequestActionType
} from '../../routing/actions/config-addressed/key-value/base-request';

export const simpleMemoryKeyValueRouterFacade: KeyValueConfigRequestRouterFacade<SimpleInMemoryKeyValueConfiguration> = {
  async handleKeyValueConfigRequest(
    context: KeyValueConfigRequestRouterContext,
    request: KeyValueConfigAddressedAction,
    config: SimpleInMemoryKeyValueConfiguration
  ): Promise<Response> {
    // Look up internal config
    const internalPath = [...request.target, 'internal'];
    const metadataDispatcher = await context.metadataManager.getClosestDispatcherMatching(internalPath);
    assert(
      metadataDispatcher,
      `Node does not have a MetadataDispatcher matching path: ${internalPath.join(', ')}`,
    );

    const internalConfig = await metadataDispatcher.getEntryAs(internalPath, ComponentName.SimpleMemoryKeyValueInternal);
    assert(
      internalConfig,
      'SimpleMemoryKeyValue internal config does not exist',
    );
    assert(
      internalConfig.remoteProcess,
      'SimpleMemoryKeyValue remote process is not ready yet'
    );

    switch (request.action) {
      case KeyValueConfigAddressedRequestActionType.Get: {
        const processRequest: KeyValueProcessGetRequest = {
          category: RequestCategory.Process,
          group: ProcessAddressedGroupName.KeyValue,
          action: KeyValueProcessAction.Get,
          targetNodeId: internalConfig.remoteProcess.nodeId,
          targetProcessId: internalConfig.remoteProcess.processId,
          key: request.key,
        };
        return context.rpcInterface.makeRequest(processRequest);
      }

      case KeyValueConfigAddressedRequestActionType.Put: {
        const processRequest: KeyValueProcessPutRequest = {
          category: RequestCategory.Process,
          group: ProcessAddressedGroupName.KeyValue,
          action: KeyValueProcessAction.Put,
          targetNodeId: internalConfig.remoteProcess.nodeId,
          targetProcessId: internalConfig.remoteProcess.processId,
          key: request.key,
          value: request.value,
        };
        await context.rpcInterface.makeRequest(processRequest);
        break;
      }

      case KeyValueConfigAddressedRequestActionType.Drop: {
        const processRequest: KeyValueProcessDropRequest = {
          category: RequestCategory.Process,
          group: ProcessAddressedGroupName.KeyValue,
          action: KeyValueProcessAction.Drop,
          targetNodeId: internalConfig.remoteProcess.nodeId,
          targetProcessId: internalConfig.remoteProcess.processId,
          key: request.key,
        };
        await context.rpcInterface.makeRequest(processRequest);
        break;
      }

      default:
        assertNever(request);
    }
  }
};
