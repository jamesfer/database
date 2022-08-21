import { WithFacadeFlag } from './scaffolding/base-facade';

export const KEY_VALUE_DATASTORE_FLAG: unique symbol = Symbol('KEY_VALUE_DATASTORE_FLAG');

export type KEY_VALUE_DATASTORE_FLAG = typeof KEY_VALUE_DATASTORE_FLAG;

declare module './scaffolding/facade-dictionary' {
  interface FacadeDictionary {
    readonly [KEY_VALUE_DATASTORE_FLAG]: KeyValueDatastore
  }
}

export interface KeyValueDatastore extends WithFacadeFlag<KEY_VALUE_DATASTORE_FLAG> {
  put(key: string, value: ArrayBuffer): Promise<void>;
  get(key: string): Promise<ArrayBuffer>;
  drop(key: string): Promise<void>;
}
