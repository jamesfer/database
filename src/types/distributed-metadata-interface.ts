import { Observable } from 'rxjs';
import { FullyQualifiedPath } from '../config/config';
import { ConfigEntry } from '../config/config-entry';

export interface DistributedMetadataInterface {
  readonly commits$: Observable<[FullyQualifiedPath, ConfigEntry]>;
  readonly isLeader$: Observable<boolean>;
  write(path: FullyQualifiedPath, configEntry: ConfigEntry): Promise<void>;
}
