import { WithFacadeFlag } from './scaffolding/base-facade';

export const STREAMING_DATASTORE_FLAG: unique symbol = Symbol("STREAMING_DATASTORE_FLAG");

export type STREAMING_DATASTORE_FLAG = typeof STREAMING_DATASTORE_FLAG;

declare module './scaffolding/facade-dictionary' {
  interface FacadeDictionary {
    readonly [STREAMING_DATASTORE_FLAG]: StreamingDatastore;
  }
}

export interface StreamingDatastore extends WithFacadeFlag<STREAMING_DATASTORE_FLAG> {
  append(timestamp: number, value: ArrayBuffer): Promise<void>;
  readAfter(timestamp: number, count: number): Promise<ArrayBuffer[]>;
  read(from: number, to: number): Promise<ArrayBuffer[]>;
}
