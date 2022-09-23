import { NEVER, Observable } from 'rxjs';
import { ProcessManager } from '../core/process-manager';
import {
  simpleMemoryKeyValueOperator
} from './simple-memory-key-value-datastore/simple-memory-key-value-operator';
import { switchFunctionOnKey } from '../utils/switch-function-on-key';
import { AnyConfigLifecycle, ComponentOperator } from './scaffolding/component-operator';
import { RpcInterface } from '../types/rpc-interface';
import { AnyRequest } from '../routing/all-request-router';
import { ConfigEntryName } from '../config/config-entry-name';
import { ConfigEntry } from '../config/config-entry';
import { hashPartitionOperator } from './hash-partition/hash-partition-operator';
import { MetadataDispatcherInterface } from '../types/metadata-dispatcher-interface';

export const emptyComponentInitializer: ComponentOperator<any> = () => NEVER;

export function allComponentOperator(
  nodeId: string,
  processManager: ProcessManager,
  metadataDispatcher: MetadataDispatcherInterface,
  rpcInterface: RpcInterface<AnyRequest>,
  nodes$: Observable<string[]>,
): ComponentOperator<ConfigEntry['name']> {
  return switchFunctionOnKey('name')<AnyConfigLifecycle, Observable<void>>({
    [ConfigEntryName.SimpleMemoryKeyValue]: simpleMemoryKeyValueOperator(processManager, metadataDispatcher, rpcInterface, nodes$),
    [ConfigEntryName.SimpleMemoryKeyValueInternal]: emptyComponentInitializer,
    [ConfigEntryName.HashPartition]: hashPartitionOperator(processManager, metadataDispatcher, rpcInterface, nodes$),
    [ConfigEntryName.HashPartitionInternal]: emptyComponentInitializer,
    // [ConfigEntryName.MetadataGroup]: emptyComponentInitializer,
  });
}
