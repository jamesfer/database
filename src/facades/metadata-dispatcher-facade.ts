import { WithFacadeFlag } from './scaffolding/base-facade';
import { FullyQualifiedPath} from '../config/config';
import { ConfigEntryName } from '../config/config-entry-name';
import { ConfigEntry, SelectConfigEntry } from '../config/config-entry';

export const METADATA_DISPATCHER_FACADE_FLAG: unique symbol = Symbol('METADATA_DISPATCHER_FACADE_FLAG');

export type METADATA_DISPATCHER_FACADE_FLAG = typeof METADATA_DISPATCHER_FACADE_FLAG;

declare module './scaffolding/facade-dictionary' {
  interface FacadeDictionary {
    readonly [METADATA_DISPATCHER_FACADE_FLAG]: MetadataDispatcherFacade
  }
}

export interface MetadataDispatcherFacade extends WithFacadeFlag<METADATA_DISPATCHER_FACADE_FLAG> {
  containsPath(path: FullyQualifiedPath): boolean;
  ownsPath(path: FullyQualifiedPath): boolean;
  getEntry(path: FullyQualifiedPath): Promise<ConfigEntry | undefined>;
  getEntryAs<N extends ConfigEntryName>(path: FullyQualifiedPath, name: N): Promise<SelectConfigEntry<N>>;
  putEntry(entry: ConfigEntry): Promise<void>;
}
