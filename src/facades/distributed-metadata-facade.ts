import { WithFacadeFlag } from './scaffolding/base-facade';
import { Observable } from 'rxjs';
import { ConfigEntry } from '../config/config-entry';

export const DISTRIBUTED_METADATA_FACADE_FLAG: unique symbol = Symbol("DISTRIBUTED_METADATA_FACADE_FLAG")

export type DISTRIBUTED_METADATA_FACADE_FLAG = typeof DISTRIBUTED_METADATA_FACADE_FLAG;

declare module './scaffolding/facade-dictionary' {
  interface FacadeDictionary {
    readonly [DISTRIBUTED_METADATA_FACADE_FLAG]: DistributedMetadataFacade
  }
}

export interface DistributedMetadataFacade extends WithFacadeFlag<DISTRIBUTED_METADATA_FACADE_FLAG> {
  readonly commits$: Observable<ConfigEntry>;
  readonly isLeader$: Observable<boolean>;
  write(configEntry: ConfigEntry): Promise<void>;
}
