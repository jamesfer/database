import { RpcInterface } from '../../../rpc/rpc-interface';
import { AnyRequest } from '../../all-request-router';
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
import { MetadataManager } from '../../../core/metadata-state/metadata-manager';

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
  rpcInterface: RpcInterface<AnyRequest>,
  metadataManager: MetadataManager,
): ConfigAddressedRouterMap {
  return {
    [ConfigEntryName.SimpleMemoryKeyValue]: {
      [ConfigAddressedGroupName.KeyValue]: simpleMemoryKeyValueEntryRouter(rpcInterface, metadataManager),
    },
    [ConfigEntryName.HashPartition]: {
      [ConfigAddressedGroupName.KeyValue]: hashPartitionKeyValueRouter(rpcInterface, metadataManager),
    }
  };
}

export const lookupConfigAddressedRouter = (
  rpcInterface: RpcInterface<AnyRequest>,
  metadataManager: MetadataManager,
): <C extends ConfigEntry, R extends ConfigAddressedRequest>(
  requestGroup: R['group'],
  configName: C['name'],
) => ConfigActionRequestRouter<C, R> | undefined => {
  const lookup = createRouterLookup(rpcInterface, metadataManager);

  return <C extends ConfigEntry, G extends ConfigAddressedRequest>(
    requestGroup: G['group'],
    configName: C['name'],
  ) => {
    return lookup[configName]?.[requestGroup] as ConfigActionRequestRouter<C, G> | undefined;
  };
};
