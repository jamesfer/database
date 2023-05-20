import { RpcInterface } from '../../rpc/rpc-interface';
import { RequestRouter } from '../types/request-router';
import { ConfigAddressedRequest } from '../actions/config-addressed/config-addressed-request';
import { MetadataManager } from '../../core/metadata-state/metadata-manager';
import { ConfigAddressedGroupName } from '../actions/config-addressed/base-config-addressed-request';
import { KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME } from '../../facades/key-value-config-request-handler';
import { assertNever } from '../../utils/assert-never';
import { AllComponentsLookup } from '../../components/scaffolding/all-components-lookup';
import { AllComponentConfigurations } from '../../components/scaffolding/all-component-configurations';
import { AnyRequestResponse } from '../actions/any-request-response';
import {
  TRANSFORMATION_RUNNER_CONFIG_REQUEST_HANDLER_FACADE
} from '../../facades/transformation-runner-config-request-handler';
import { COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE } from '../../facades/component-state-config-request-handler';
import { ROW_BLOCK_CONFIG_REQUEST_HANDLER_FACADE } from '../../facades/row-block-config-request-handler';
import { ConfigAddressedResponse } from '../actions/config-addressed/config-addressed-response';
import { AnyResponse } from '../any-response';
import { ConfigAddressedAction } from '../actions/config-addressed/config-addressed-action';

async function handleRequestOnConfig(
  rpcInterface: RpcInterface<AnyRequestResponse>,
  metadataManager: MetadataManager,
  request: ConfigAddressedRequest,
  config: AllComponentConfigurations,
): Promise<ConfigAddressedResponse> {
  const component = AllComponentsLookup[config.NAME];

  switch (request.group) {
    case ConfigAddressedGroupName.KeyValue: {
      if (KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME in component.FACADES) {
        return component.FACADES[KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME].handleKeyValueConfigRequest(
          { rpcInterface, metadataManager },
          request,
          config as any,
        );
      }
    }
      break;

    case ConfigAddressedGroupName.TransformationRunner: {
      if (TRANSFORMATION_RUNNER_CONFIG_REQUEST_HANDLER_FACADE in component.FACADES) {
        return component.FACADES[TRANSFORMATION_RUNNER_CONFIG_REQUEST_HANDLER_FACADE].handleTransformationRunnerProcessRequest(
          { rpcInterface, metadataManager },
          request,
          config as any,
        );
      }
    }
      break;

    case ConfigAddressedGroupName.ComponentState: {
      if (COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE in component.FACADES) {
        return component.FACADES[COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE].handleComponentStateConfigRequest(
          { rpcInterface, metadataManager },
          request,
          config as any,
        );
      }
    }
      break;

    case ConfigAddressedGroupName.RowBlock: {
      if (ROW_BLOCK_CONFIG_REQUEST_HANDLER_FACADE in component.FACADES) {
        return component.FACADES[ROW_BLOCK_CONFIG_REQUEST_HANDLER_FACADE].handleRowBlockConfigRequest(
          { rpcInterface, metadataManager },
          request,
          config as any,
        );
      }
    }
      break;

    default:
      assertNever(request);
  }

  throw new Error(`Config does not support this request. Config type: ${config.NAME}, request group: ${request.group}`);
}

export const configAddressedRequestRouter = (
  rpcInterface: RpcInterface<AnyRequestResponse>,
  metadataManager: MetadataManager,
): RequestRouter<ConfigAddressedAction['request'], ConfigAddressedAction['response']> => async (request) => {
  // Find the metadata dispatcher
  const metadataDispatcher = metadataManager.getClosestDispatcherMatching(request.target);
  if (!metadataDispatcher) {
    throw new Error(`Node does not have a MetadataDispatcher matching path: ${request.target.join(', ')}`);
  }

  // Load the config entry
  const config = await metadataDispatcher.getEntry(request.target);
  if (!config) {
    throw new Error(`Config does not exist at path: ${request.target}`);
  }

  // Find the matching router instance
  return handleRequestOnConfig(rpcInterface, metadataManager, request, config);
};
