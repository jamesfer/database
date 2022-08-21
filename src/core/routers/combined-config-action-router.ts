import { RPCInterface } from '../../types/rpc-interface';
import { AnyRequest } from './combined-router';
import { KeyValueConfigRequest } from './key-value-config-request';
import { RequestRouter } from './scaffolding/request-router';
import { ConfigEntry, SelectConfigEntry } from '../../types/config';
import { MetadataDispatcherFacade } from '../../facades/metadata-dispatcher-facade';
import { Refine } from '../../types/refine';
import { ConfigActionGroupName } from './scaffolding/base-config-action-request';
import { ConfigEntryName } from '../../config/scaffolding/config';
import {
  simpleMemoryKeyValueEntryRouter
} from '../../components/simple-memory-key-value-datastore/simple-memory-key-value-entry-router';
import { Response } from './scaffolding/response';

export type ConfigActionRequest =
  | KeyValueConfigRequest;

type ConfigActionRequestRouter<C extends ConfigEntry, R extends ConfigActionRequest> = (config: C) => RequestRouter<R>;

type RequestGroupLookup<C extends ConfigEntry> = {
  [G in ConfigActionRequest['group']]?: ConfigActionRequestRouter<C, Refine<ConfigActionRequest, { group: G }>>
};

type ConfigRouterLookup = {
  [C in ConfigEntry['name']]?: RequestGroupLookup<SelectConfigEntry<C>>
};

function routeRequest<C extends ConfigEntry, R extends ConfigActionRequest>(
  config: C,
  request: R,
  lookup: ConfigRouterLookup,
): Promise<Response> {
  // Search for the correct sub router
  const requestGroupLookup = lookup[config.name] as RequestGroupLookup<C> | undefined;
  const router = requestGroupLookup?.[request.group] as ConfigActionRequestRouter<C, R> | undefined;
  if (!router) {
    throw new Error(`Config does not support this request. Config type: ${config.name}, request group: ${request.group}`);
  }

  return router(config)(request);
}

export function combinedConfigActionRouter(
  rpcInterface: RPCInterface<AnyRequest>,
  metadataDispatcher: MetadataDispatcherFacade,
): RequestRouter<ConfigActionRequest> {
  const lookup: ConfigRouterLookup = {
    [ConfigEntryName.SimpleMemoryKeyValue]: {
      [ConfigActionGroupName.KeyValue]: simpleMemoryKeyValueEntryRouter(rpcInterface, metadataDispatcher),
    },
  };

  return async (request) => {
    // Load the config entry
    const config = await metadataDispatcher.getEntry(request.target);
    if (!config) {
      throw new Error(`Config does not exist at path: ${config}`);
    }

    return routeRequest(config, request, lookup);
  };
}
