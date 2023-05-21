import { RpcInterface } from '../../../rpc/rpc-interface';
import { RequestRouter } from '../../types/request-router';
import { ConfigAddressedRequest } from './config-addressed-request';
import { MetadataManager } from '../../../core/metadata-state/metadata-manager';
import { ConfigAddressedGroupName } from './base-config-addressed-request';
import { KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME } from '../../../facades/key-value-config-request-handler';
import { Response } from '../../types/response';
import { assertNever } from '../../../utils/assert-never';
import { AllComponentConfigurations } from '../../../components/scaffolding/all-component-configurations';
import { AnyRequest } from '../any-request';
import {
  TRANSFORMATION_RUNNER_CONFIG_REQUEST_HANDLER_FACADE
} from '../../../facades/transformation-runner-config-request-handler';
import { COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE } from '../../../facades/component-state-config-request-handler';
import { getFacade } from '../../../components/scaffolding/component-utils';

async function handleRequestOnConfig(
  rpcInterface: RpcInterface<AnyRequest>,
  metadataManager: MetadataManager,
  request: ConfigAddressedRequest,
  config: AllComponentConfigurations,
): Promise<Response> {
  switch (request.group) {
    case ConfigAddressedGroupName.KeyValue: {
      const routerFacade = getFacade(config.NAME, KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME);
      if (!routerFacade) {
        return;
      }

      return routerFacade.handleKeyValueConfigRequest(
        { rpcInterface, metadataManager },
        request,
        config as any,
      );
    }

    case ConfigAddressedGroupName.TransformationRunner: {
      const routerFacade = getFacade(config.NAME, TRANSFORMATION_RUNNER_CONFIG_REQUEST_HANDLER_FACADE);
      if (!routerFacade) {
        return;
      }

      return routerFacade.handleTransformationRunnerProcessRequest(
        { rpcInterface, metadataManager },
        request,
        config as any,
      );
    }

    case ConfigAddressedGroupName.ComponentState: {
      const routerFacade = getFacade(config.NAME, COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE);
      if (!routerFacade) {
        return;
      }

      return routerFacade.handleComponentStateConfigRequest(
        { rpcInterface, metadataManager },
        request,
        config as any,
      );
    }

    default:
      assertNever(request);
  }

  throw new Error(`Config does not support this request. Config type: ${config.NAME}, request group: ${request.group}`);
}

export const configAddressedRequestRouter = (
  rpcInterface: RpcInterface<AnyRequest>,
  metadataManager: MetadataManager,
): RequestRouter<ConfigAddressedRequest> => async (request) => {
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
