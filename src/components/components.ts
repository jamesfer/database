import { ConfigEntry, ConfigEntryName, SelectConfigEntry } from '../types/config';
import { Observable } from 'rxjs';
import { BaseFacade, FACADE_FLAGS } from '../facades/scaffolding/base-facade';
import { MetadataGroup } from './metadata-group/metadata-group';

type ComponentInitializer<T extends ConfigEntry> = (key: string, config$: Observable<T>) => Promise<BaseFacade>;

export const emptyFacade: BaseFacade = { [FACADE_FLAGS]: {} };

export const componentInitializers: { [K in ConfigEntry['name']]: ComponentInitializer<SelectConfigEntry<K>> } = {
  [ConfigEntryName.KeyValue]: async () => emptyFacade,
  [ConfigEntryName.Folder]: async () => emptyFacade,
  [ConfigEntryName.RestApi]: async () => emptyFacade,
  // TODO finish this initialization
  [ConfigEntryName.MetadataGroup]: async (key, config$) => MetadataGroup.initialize(key, config$, []),
};
