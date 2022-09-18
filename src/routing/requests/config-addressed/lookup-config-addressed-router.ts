import { RPCInterface } from '../../../types/rpc-interface';
import { AnyRequest } from '../../all-request-router';
import { MetadataDispatcherFacade } from '../../../facades/metadata-dispatcher-facade';
import { ConfigEntryName } from '../../../config/config-entry-name';
import { FullyQualifiedPath } from '../../../config/config';
import { RequestRouter } from '../../types/request-router';
import { ConfigEntry, SelectConfigEntry } from '../../../config/config-entry';
import { Refine } from '../../../types/refine';
import { ConfigAddressedGroupName } from './base-config-addressed-request';
import {
  simpleMemoryKeyValueEntryRouter
} from '../../../components/simple-memory-key-value-datastore/simple-memory-key-value-entry-router';
import { hashPartitionKeyValueRouter } from '../../../components/hash-partition/hash-partition-key-value-router';
import { ConfigAddressedRequest } from './config-addressed-request';

type ConfigActionRequestRouter<C extends ConfigEntry, R extends ConfigAddressedRequest> = (
  path: FullyQualifiedPath,
  config: C,
) => RequestRouter<R>;

type RequestGroupLookup<C extends ConfigEntry> = {
  [G in ConfigAddressedRequest['group']]?: ConfigActionRequestRouter<C, Refine<ConfigAddressedRequest, { group: G }>>
};

type ConfigAddressedRouterMap = {
  [C in ConfigEntry['name']]?: RequestGroupLookup<SelectConfigEntry<C>>
};

function createRouterLookup(
  rpcInterface: RPCInterface<AnyRequest>,
  metadataDispatcher: MetadataDispatcherFacade,
): ConfigAddressedRouterMap {
  return {
    [ConfigEntryName.SimpleMemoryKeyValue]: {
      [ConfigAddressedGroupName.KeyValue]: simpleMemoryKeyValueEntryRouter(rpcInterface, metadataDispatcher),
    },
    [ConfigEntryName.HashPartition]: {
      [ConfigAddressedGroupName.KeyValue]: hashPartitionKeyValueRouter(rpcInterface, metadataDispatcher),
    }
  };
}

export const lookupConfigAddressedRouter = (
  rpcInterface: RPCInterface<AnyRequest>,
  metadataDispatcher: MetadataDispatcherFacade,
): <C extends ConfigEntry, R extends ConfigAddressedRequest>(
  requestGroup: R['group'],
  configName: C['name'],
) => ConfigActionRequestRouter<C, R> | undefined => {
  const lookup = createRouterLookup(rpcInterface, metadataDispatcher);

  return <C extends ConfigEntry, G extends ConfigAddressedRequest>(
    requestGroup: G['group'],
    configName: C['name'],
  ) => {
    return lookup[configName]?.[requestGroup] as ConfigActionRequestRouter<C, G> | undefined;
  };
};
