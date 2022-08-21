import { ConfigEntry, SelectConfigEntry } from '../types/config';
import { FacadeDictionary, FacadeDictionaryKey } from './scaffolding/facade-dictionary';
import { FACADES_KEY } from './scaffolding/base-facade';
import { ConfigFacadeConstructor } from './config-facades-lookup';
import {
  simpleMemoryKeyValueDatastoreConfigFacades
} from '../components/simple-memory-key-value-datastore/simple-memory-key-value-datastore-config-facades';
import { ConfigEntryName } from '../config/scaffolding/config';

const emptyBaseFacade = { [FACADES_KEY]: {} };

const emptyFacadeConstructor: ConfigFacadeConstructor<ConfigEntry> = () => emptyBaseFacade;

const configFacadesLookup: { [N in ConfigEntry['name']]: ConfigFacadeConstructor<SelectConfigEntry<N>> } = {
  [ConfigEntryName.SimpleMemoryKeyValue]: simpleMemoryKeyValueDatastoreConfigFacades,
  [ConfigEntryName.SimpleMemoryKeyValueInternal]: emptyFacadeConstructor,
  [ConfigEntryName.SimpleMemoryKeyValueInstance]: emptyFacadeConstructor,
  [ConfigEntryName.MetadataGroup]: emptyFacadeConstructor,
  [ConfigEntryName.RestApi]: emptyFacadeConstructor,
  [ConfigEntryName.Folder]: emptyFacadeConstructor,
};

export function castConfigAsFacade<C extends ConfigEntry, K extends FacadeDictionaryKey>(
  config: C,
  facadeKey: K,
): FacadeDictionary[K] | undefined {
  const constructor = configFacadesLookup[config.name] as  ConfigFacadeConstructor<C> | undefined;
  if (!constructor) {
    throw new Error(`Could not find config name "${config.name}" in config facades lookup`);
  }

  // A type case is required here because Typescript can't convert
  // Partial<FacadeDictionary, F> to FacadeDictionary[F] | undefined
  return constructor(config)[FACADES_KEY][facadeKey] as FacadeDictionary[K] | undefined;
}
