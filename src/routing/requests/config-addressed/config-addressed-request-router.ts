import { RpcInterface } from '../../../rpc/rpc-interface';
import { RequestRouter } from '../../types/request-router';
import { ConfigAddressedRequest } from './config-addressed-request';
import { MetadataManager } from '../../../core/metadata-state/metadata-manager';
import { ConfigAddressedGroupName } from './base-config-addressed-request';
import { KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME } from '../../../facades/key-value-config-request-handler';
import { Response } from '../../types/response';
import { assertNever } from '../../../utils/assert-never';
import { AllComponentsLookup } from '../../../components/scaffolding/all-components-lookup';
import { AllComponentConfigurations } from '../../../components/scaffolding/all-component-configurations';
import { AnyRequest } from '../any-request';
import {
  TRANSFORMATION_RUNNER_CONFIG_REQUEST_HANDLER_FACADE
} from '../../../facades/transformation-runner-config-request-handler';

async function handleRequestOnConfig(
  rpcInterface: RpcInterface<AnyRequest>,
  metadataManager: MetadataManager,
  request: ConfigAddressedRequest,
  config: AllComponentConfigurations,
): Promise<Response> {
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
