import { ConfigEntry, ConfigEntryName, SelectConfigEntry } from '../types/config';
import { NEVER, Observable } from 'rxjs';
import { ProcessManager } from '../core/process-manager';
import { MetadataDispatcher } from '../core/metadata-state/metadata-dispatcher';
import {
  simpleMemoryKeyValueDatastoreHandler
} from './simple-memory-key-value-datastore/simple-memory-key-value-datastore-handler';

type ComponentInitializer<T extends ConfigEntry> = (
  processManager: ProcessManager,
  metadataDispatcher: MetadataDispatcher,
  config$: Observable<T>,
) => Observable<void>;

export const emptyComponentInitializer: ComponentInitializer<any> = () => NEVER;

export const componentInitializers: { [K in ConfigEntry['name']]: ComponentInitializer<SelectConfigEntry<K>> } = {
  [ConfigEntryName.SimpleMemoryKeyValue]: simpleMemoryKeyValueDatastoreHandler,
  [ConfigEntryName.SimpleMemoryKeyValueInternal]: emptyComponentInitializer,
  [ConfigEntryName.Folder]: emptyComponentInitializer,
  [ConfigEntryName.RestApi]: emptyComponentInitializer,
  // TODO finish this initialization
  // [ConfigEntryName.MetadataGroup]: async (key, config$) => MetadataGroup.initialize(key, config$, []),
  [ConfigEntryName.MetadataGroup]: emptyComponentInitializer,
};
