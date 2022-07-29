import { FacadeFlagMap } from './scaffolding/facade-flag-map';
import { FACADE_FLAGS, WithFacadeFlag } from './scaffolding/base-facade';

export const KEY_VALUE_DATASTORE_FLAG: unique symbol = Symbol("KEY_VALUE_DATASTORE_FLAG")

export type KEY_VALUE_DATASTORE_FLAG = typeof KEY_VALUE_DATASTORE_FLAG;

declare module '../facades/scaffolding/facade-flag-map' {
  interface FacadeFlagMap {
    readonly [KEY_VALUE_DATASTORE_FLAG]: KeyValueDatastore
  }
}

export interface KeyValueDatastore extends WithFacadeFlag<KEY_VALUE_DATASTORE_FLAG> {}
