import { RPCInterface } from '../types/rpc-interface';
import { AnyRequest } from './all-request-router';
import { KeyValueConfigRequest } from './requests/key-value-config-request';
import { RequestRouter } from './types/request-router';
import { MetadataDispatcherFacade } from '../facades/metadata-dispatcher-facade';
import { Refine } from '../types/refine';
import { ConfigActionGroupName } from './requests/base-config-action-request';
import {
  simpleMemoryKeyValueEntryRouter
} from '../components/simple-memory-key-value-datastore/simple-memory-key-value-entry-router';
import { Response } from './types/response';
import { ConfigEntryName } from '../config/config-entry-name';
import { ConfigEntry, SelectConfigEntry } from '../config/config-entry';
import { FullyQualifiedPath } from '../config/config';
import { hashPartitionKeyValueRouter } from '../components/hash-partition/hash-partition-key-value-router';

export type ConfigActionRequest =
  | KeyValueConfigRequest;

type ConfigActionRequestRouter<C extends ConfigEntry, R extends ConfigActionRequest> = (
  path: FullyQualifiedPath,
  config: C,
) => RequestRouter<R>;

type RequestGroupLookup<C extends ConfigEntry> = {
  [G in ConfigActionRequest['group']]?: ConfigActionRequestRouter<C, Refine<ConfigActionRequest, { group: G }>>
};

type ConfigRouterLookup = {
  [C in ConfigEntry['name']]?: RequestGroupLookup<SelectConfigEntry<C>>
};

// TODO put this in a better location
function getLookup(
  rpcInterface: RPCInterface<AnyRequest>,
  metadataDispatcher: MetadataDispatcherFacade,
): ConfigRouterLookup {
  return {
    [ConfigEntryName.SimpleMemoryKeyValue]: {
      [ConfigActionGroupName.KeyValue]: simpleMemoryKeyValueEntryRouter(rpcInterface, metadataDispatcher),
    },
    [ConfigEntryName.HashPartition]: {
      [ConfigActionGroupName.KeyValue]: hashPartitionKeyValueRouter(rpcInterface, metadataDispatcher),
    }
  };
}

function routeRequest<C extends ConfigEntry, R extends ConfigActionRequest>(
  path: FullyQualifiedPath,
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

  return router(path, config)(request);
}

export function combinedConfigActionRouter(
  rpcInterface: RPCInterface<AnyRequest>,
  metadataDispatcher: MetadataDispatcherFacade,
): RequestRouter<ConfigActionRequest> {
  const lookup: ConfigRouterLookup = getLookup(rpcInterface, metadataDispatcher);

  return async (request) => {
    // Load the config entry
    const config = await metadataDispatcher.getEntry(request.target);
    if (!config) {
      throw new Error(`Config does not exist at path: ${config}`);
    }

    return routeRequest(request.target, config, request, lookup);
  };
}
