import {
  KEY_VALUE_DATASTORE_FLAG,
  KeyValueDatastore as KeyValueDatastoreFacade
} from '../../facades/key-value-datastore';
import { BaseFacade, FACADE_FLAGS } from '../../facades/scaffolding/base-facade';

export class SimpleMemoryKeyValueDatastore implements BaseFacade, KeyValueDatastoreFacade {
  readonly [FACADE_FLAGS]: KeyValueDatastoreFacade[FACADE_FLAGS] = {
    [KEY_VALUE_DATASTORE_FLAG]: this,
  };

  static async initialize(
    key: string,
  ): Promise<SimpleMemoryKeyValueDatastore> {
    return new SimpleMemoryKeyValueDatastore(key);
  }

  private readonly storage: Map<string, ArrayBuffer> = new Map();

  private constructor(
    private readonly key: string,
  ) {}

  async put(key: string, value: ArrayBuffer): Promise<void> {
    this.storage.set(key, value);
  }

  async get(key: string): Promise<ArrayBuffer> {
    const result = this.storage.get(key);
    if (!result) {
      throw new Error(`Could not get key "${key}" from SimpleMemoryKeyValueDatastore because it didn't exist`);
    }
    return result;
  }

  async drop(key: string): Promise<void> {
    const success = this.storage.delete(key);
    if (!success) {
      throw new Error(`Could not delete key "${key}" from SimpleMemoryKeyValueDatastore because it didn't exist`);
    }
  }
}
