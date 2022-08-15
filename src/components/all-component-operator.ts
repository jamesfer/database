import { ConfigEntry, ConfigEntryName } from '../types/config';
import { EMPTY, NEVER, Observable } from 'rxjs';
import { ProcessManager } from '../core/process-manager';
import {
  simpleMemoryKeyValueDatastoreOperator
} from './simple-memory-key-value-datastore/simple-memory-key-value-datastore-operator';
import { switchFunctionOnKey } from '../utils/switch-function-on-key';
import { MetadataDispatcherFacade } from '../facades/metadata-dispatcher-facade';
import { AnyConfigLifecycle, ComponentOperator } from './component-operator';
import { RPCInterface } from '../types/rpc-interface';
import { AnyRequest } from '../core/routers/all-router';

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
    [ConfigEntryName.SimpleMemoryKeyValueInstance]: emptyComponentInitializer,
    [ConfigEntryName.Folder]: emptyComponentInitializer,
    [ConfigEntryName.RestApi]: emptyComponentInitializer,
    // TODO finish this initialization
    // [ConfigEntryName.MetadataGroup]: async (key, config$) => MetadataGroup.initialize(key, config$, []),
    [ConfigEntryName.MetadataGroup]: emptyComponentInitializer,
  });
}
