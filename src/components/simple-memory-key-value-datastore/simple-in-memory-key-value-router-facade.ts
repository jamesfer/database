import {
  KeyValueConfigAddressedRequest,
  KeyValueConfigAddressedRequestAction
} from '../../routing/requests/key-value-config-addressed-request';
import {
  KeyValueProcessAction,
  KeyValueProcessDropRequest,
  KeyValueProcessGetRequest,
  KeyValueProcessPutRequest
} from '../../routing/requests/key-value-node-request';
import { RequestCategory } from '../../routing/types/request-category';
import { ProcessAddressedGroupName } from '../../routing/requests/process-addressed/base-process-addressed-request';
import { assertNever } from '../../utils/assert-never';
import { SimpleInMemoryKeyValueConfiguration } from './simple-in-memory-key-value-configuration';
import {
  KeyValueConfigRequestRouterContext,
  KeyValueConfigRequestRouterFacade
} from '../../facades/key-value-config-request-handler';
import { Response } from '../../routing/types/response';
import { assert } from '../../utils/assert';
import { ComponentName } from '../scaffolding/component-name';

export const simpleMemoryKeyValueRouterFacade: KeyValueConfigRequestRouterFacade<SimpleInMemoryKeyValueConfiguration> = {
  async handleKeyValueConfigRequest(
    context: KeyValueConfigRequestRouterContext,
    request: KeyValueConfigAddressedRequest,
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
      case KeyValueConfigAddressedRequestAction.Get: {
        const processRequest: KeyValueProcessGetRequest = {
          category: RequestCategory.ProcessAction,
          group: ProcessAddressedGroupName.KeyValue,
          action: KeyValueProcessAction.Get,
          targetNodeId: internalConfig.remoteProcess.nodeId,
          targetProcessId: internalConfig.remoteProcess.processId,
          key: request.key,
        };
        return context.rpcInterface.makeRequest(processRequest);
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
        await context.rpcInterface.makeRequest(processRequest);
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
        await context.rpcInterface.makeRequest(processRequest);
        break;
      }

      default:
        assertNever(request);
    }
  }
};
