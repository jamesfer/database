import { NEVER, Observable } from 'rxjs';
import { ProcessManager } from '../core/process-manager';
import {
  simpleMemoryKeyValueDatastoreOperator
} from './simple-memory-key-value-datastore/simple-memory-key-value-datastore-operator';
import { switchFunctionOnKey } from '../utils/switch-function-on-key';
import { MetadataDispatcherFacade } from '../facades/metadata-dispatcher-facade';
import { AnyConfigLifecycle, ComponentOperator } from './scaffolding/component-operator';
import { RPCInterface } from '../types/rpc-interface';
import { AnyRequest } from '../routing/all-request-router';
import { ConfigEntryName } from '../config/config-entry-name';
import { ConfigEntry } from '../config/config-entry';
import { hashPartitionOperator } from './hash-partition/hash-partition-operator';

export const emptyComponentInitializer: ComponentOperator<any> = () => NEVER;

export function allComponentOperator(
  nodeId: string,
  processManager: ProcessManager,
  metadataDispatcher: MetadataDispatcherFacade,
  rpcInterface: RPCInterface<AnyRequest>,
  nodes$: Observable<string[]>,
): ComponentOperator<ConfigEntry['name']> {
  return switchFunctionOnKey('name')<AnyConfigLifecycle, Observable<void>>({
    [ConfigEntryName.SimpleMemoryKeyValue]: simpleMemoryKeyValueDatastoreOperator(processManager, metadataDispatcher, rpcInterface, nodes$),
    [ConfigEntryName.SimpleMemoryKeyValueInternal]: emptyComponentInitializer,
    [ConfigEntryName.HashPartition]: hashPartitionOperator(processManager, metadataDispatcher, rpcInterface, nodes$),
    [ConfigEntryName.HashPartitionInternal]: emptyComponentInitializer,
    [ConfigEntryName.MetadataGroup]: emptyComponentInitializer,
  });
}
