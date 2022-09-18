import { RPCInterface } from '../../../types/rpc-interface';
import { AnyRequest } from '../../all-request-router';
import { RequestRouter } from '../../types/request-router';
import { MetadataDispatcherFacade } from '../../../facades/metadata-dispatcher-facade';
import { lookupConfigAddressedRouter } from './lookup-config-addressed-router';
import { ConfigAddressedRequest } from './config-addressed-request';

export function allConfigAddressedRequestRouter(
  rpcInterface: RPCInterface<AnyRequest>,
  metadataDispatcher: MetadataDispatcherFacade,
): RequestRouter<ConfigAddressedRequest> {
  const lookupRouter = lookupConfigAddressedRouter(rpcInterface, metadataDispatcher);

  return async (request) => {
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
