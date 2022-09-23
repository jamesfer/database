import { RpcInterface } from '../../../types/rpc-interface';
import { AnyRequest } from '../../all-request-router';
import { RequestRouter } from '../../types/request-router';
import { lookupConfigAddressedRouter } from './lookup-config-addressed-router';
import { ConfigAddressedRequest } from './config-addressed-request';
import { MetadataDispatcherInterface } from '../../../types/metadata-dispatcher-interface';
import { MetadataManager } from '../../../core/metadata-state/metadata-manager';

export function allConfigAddressedRequestRouter(
  rpcInterface: RpcInterface<AnyRequest>,
  metadataManager: MetadataManager,
): RequestRouter<ConfigAddressedRequest> {
  const lookupRouter = lookupConfigAddressedRouter(rpcInterface, metadataManager);

  return async (request) => {
    // Find the metadata dispatcher
    const metadataDispatcher = await metadataManager.getClosestDispatcherMatching(request.target);
    if (!metadataDispatcher) {
      throw new Error(`Node does not have a MetadataDispatcher matching path: ${request.target.join(', ')}`)
    }

    // Load the config entry
    const config = await metadataDispatcher.getEntry(request.target);
    if (!config) {
      throw new Error(`Config does not exist at path: ${config}`);
    }

    // Find the matching router instance
    const router = lookupRouter(request.group, config.name);
    if (!router) {
      throw new Error(`Config does not support this request. Config type: ${config.name}, request group: ${request.group}`);
    }

    return router(request.target, config)(request);
  };
}
