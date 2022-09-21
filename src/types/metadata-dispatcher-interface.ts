import { FullyQualifiedPath } from '../config/config';
import { ConfigEntry, SelectConfigEntry } from '../config/config-entry';
import { ConfigEntryName } from '../config/config-entry-name';

export interface MetadataDispatcherInterface {
  containsPath(path: FullyQualifiedPath): boolean;
  ownsPath(path: FullyQualifiedPath): boolean;
  getEntry(path: FullyQualifiedPath): Promise<ConfigEntry | undefined>;
  getEntryAs<N extends ConfigEntryName>(path: FullyQualifiedPath, name: N): Promise<SelectConfigEntry<N>>;
  putEntry(path: FullyQualifiedPath, entry: ConfigEntry): Promise<void>;
}
