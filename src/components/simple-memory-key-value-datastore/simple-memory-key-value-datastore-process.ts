import {
  KEY_VALUE_DATASTORE_FLAG,
  KeyValueDatastore as KeyValueDatastoreFacade
} from '../../facades/key-value-datastore';
import { BaseFacade, FACADES_KEY, PickFacades } from '../../facades/scaffolding/base-facade';
import { KEY_VALUE_PROCESS_ROUTER_FLAG } from '../../facades/key-value-process-router';
import { simpleMemoryKeyValueProcessRouter } from './simple-memory-key-value-process-router';

export class SimpleMemoryKeyValueDatastoreProcess implements BaseFacade, KeyValueDatastoreFacade {
  readonly [FACADES_KEY]: PickFacades<KEY_VALUE_DATASTORE_FLAG | KEY_VALUE_PROCESS_ROUTER_FLAG> = {
    [KEY_VALUE_DATASTORE_FLAG]: this,
    [KEY_VALUE_PROCESS_ROUTER_FLAG]: simpleMemoryKeyValueProcessRouter(this),
  };

  static async initialize(): Promise<SimpleMemoryKeyValueDatastoreProcess> {
    return new SimpleMemoryKeyValueDatastoreProcess();
  }

  private readonly storage: Map<string, ArrayBuffer> = new Map();

  private constructor() {}

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
