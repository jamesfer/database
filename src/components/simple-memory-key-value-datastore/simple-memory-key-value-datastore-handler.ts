import {
  ConfigEntry,
  ConfigEntryName,
  SimpleMemoryKeyValueEntry,
  SimpleMemoryKeyValueInternalEntry
} from '../../types/config';
import { concatMap } from 'rxjs/operators';
import { MetadataChangeHandler } from '../../types/metadata-change-handler';
import { ProcessManager } from '../../core/process-manager';
import { MetadataDispatcher } from '../../core/metadata-state/metadata-dispatcher';
import { uniqueId } from 'lodash';
import { SimpleMemoryKeyValueDatastore } from './simple-memory-key-value-datastore';
import { Observable } from 'rxjs';

export function simpleMemoryKeyValueDatastoreHandler(
  processManager: ProcessManager,
  metadataManager: MetadataDispatcher,
  config$: Observable<SimpleMemoryKeyValueEntry>,
): Observable<void> {
  return config$.pipe(
    concatMap(async (config) => {
      const internalConfigPath = [...config.id, 'internal'];
      let internalConfig: ConfigEntry | undefined = await metadataManager.getEntry(internalConfigPath);
      if (internalConfig && internalConfig.name !== ConfigEntryName.SimpleMemoryKeyValueInternal) {
        console.error('Simple memory key value datastore has the wrong internal config type');
        return;
      }

      if (!internalConfig) {
        // Create the internal config store
        internalConfig = new SimpleMemoryKeyValueInternalEntry(internalConfigPath, undefined);
        await metadataManager.putEntry(internalConfig);
      }

      if (!internalConfig.processId) {
        // Create the main process for storing the keys and values
        const processId = uniqueId('simpleMemoryKeyValueDatastore');
        processManager.register(processId, new SimpleMemoryKeyValueDatastore(config.id.join('/')));

        internalConfig = new SimpleMemoryKeyValueInternalEntry(internalConfigPath, processId);
        await metadataManager.putEntry(internalConfig);
      }
    }),
  );
}

// export class SimpleMemoryKeyValueDatastoreManager implements BaseFacade, KeyValueDatastoreFacade {
//   readonly [FACADE_FLAGS]: KeyValueDatastoreFacade[typeof FACADE_FLAGS] = {
//     [KEY_VALUE_DATASTORE_FLAG]: this,
//   };
//
//   static async initialize(
//     key: string,
//     config$: Observable<SimpleMemoryKeyValueEntry>,
//   ): Promise<SimpleMemoryKeyValueDatastoreManager> {
//     return new SimpleMemoryKeyValueDatastoreManager(key, config$);
//   }
//
//   private readonly storage: Map<string, ArrayBuffer> = new Map();
//
//   private readonly subscription = this.config$.pipe(
//     finalize(() => {
//       // Clean up resources
//       // This is pretty pointless, but it represents what we would actually do
//       // with real resources at this point.
//       this.storage.clear();
//     }),
//   ).subscribe();
//
//   private constructor(
//     private readonly key: string,
//     private readonly config$: Observable<SimpleMemoryKeyValueEntry>,
//   ) {}
//
//   async put(key: string, value: ArrayBuffer): Promise<void> {
//     this.storage.set(key, value);
//   }
//
//   async get(key: string): Promise<ArrayBuffer> {
//     const result = this.storage.get(key);
//     if (!result) {
//       throw new Error(`Could not get key "${key}" from SimpleMemoryKeyValueDatastore because it didn't exist`);
//     }
//     return result;
//   }
//
//   async drop(key: string): Promise<void> {
//     const success = this.storage.delete(key);
//     if (!success) {
//       throw new Error(`Could not delete key "${key}" from SimpleMemoryKeyValueDatastore because it didn't exist`);
//     }
//   }
//
//   async cleanup() {
//     this.subscription.unsubscribe();
//   }
// }
