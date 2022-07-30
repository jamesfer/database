import {
  KEY_VALUE_DATASTORE_FLAG,
  KeyValueDatastore as KeyValueDatastoreFacade
} from '../../facades/key-value-datastore';
import { BaseFacade, FACADE_FLAGS } from '../../facades/scaffolding/base-facade';
import { Observable } from 'rxjs';
import { SimpleMemoryKeyValueEntry } from '../../types/config';
import { finalize } from 'rxjs/operators';

export class SimpleMemoryKeyValueDatastore implements BaseFacade, KeyValueDatastoreFacade {
  readonly [FACADE_FLAGS]: KeyValueDatastoreFacade[typeof FACADE_FLAGS] = {
    [KEY_VALUE_DATASTORE_FLAG]: this,
  };

  static async initialize(
    key: string,
    config$: Observable<SimpleMemoryKeyValueEntry>,
  ): Promise<SimpleMemoryKeyValueDatastore> {
    return new SimpleMemoryKeyValueDatastore(key, config$);
  }

  private readonly storage: Map<string, ArrayBuffer> = new Map();

  private readonly subscription = this.config$.pipe(
    finalize(() => {
      // Clean up resources
      // This is pretty pointless, but it represents what we would actually do
      // with real resources at this point.
      this.storage.clear();
    }),
  ).subscribe();

  private constructor(
    private readonly key: string,
    private readonly config$: Observable<SimpleMemoryKeyValueEntry>,
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

  async cleanup() {
    this.subscription.unsubscribe();
  }
}
