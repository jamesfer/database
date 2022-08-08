import { ProcessManager } from '../process-manager';
import { ConfigEntryName, FullyQualifiedPath } from '../../types/config';
import { KEY_VALUE_DATASTORE_FLAG } from '../../facades/key-value-datastore';
import { MetadataDispatcherFacade } from '../../facades/metadata-dispatcher-facade';

export class KeyValueApi {
  public static async initialize(
    nodeId: string,
    metadataDispatcher: MetadataDispatcherFacade,
    processManager: ProcessManager,
  ): Promise<KeyValueApi> {
    return new KeyValueApi(nodeId, metadataDispatcher, processManager);
  }

  private constructor(
    private readonly nodeId: string,
    private readonly metadataDispatcher: MetadataDispatcherFacade,
    private readonly processManager: ProcessManager,
  ) {}

  async put(path: FullyQualifiedPath, key: string, value: ArrayBuffer): Promise<void> {
    const config = await this.metadataDispatcher.getEntry(path);
    if (!config || config.name !== ConfigEntryName.SimpleMemoryKeyValue) {
      throw new Error(`Could not find key value config at ${path.join('/')}`);
    }

    const internalConfig = await this.metadataDispatcher.getEntry([...path, 'internal']);
    if (!internalConfig || internalConfig.name !== ConfigEntryName.SimpleMemoryKeyValueInternal) {
      throw new Error(`Could not find key value config at ${[...path, 'internal'].join('/')}`);
    }

    if (!internalConfig.processId) {
      throw new Error('KeyValueDatastore internal config is not ready yet');
    }

    const keyValueDatastore = this.processManager.getProcessByIdAs(internalConfig.processId, KEY_VALUE_DATASTORE_FLAG);
    if (!keyValueDatastore) {
      throw new Error(`Could not find compatible datastore process with id ${internalConfig.processId} and path ${path.join('/')}`);
    }

    keyValueDatastore.put(key, value);
  }

  async get(path: FullyQualifiedPath, key: string): Promise<ArrayBuffer | undefined> {
    const config = await this.metadataDispatcher.getEntry(path);
    if (!config || config.name !== ConfigEntryName.SimpleMemoryKeyValue) {
      throw new Error(`Could not find key value config at ${path.join('/')}`);
    }

    const internalConfig = await this.metadataDispatcher.getEntry([...path, 'internal']);
    if (!internalConfig || internalConfig.name !== ConfigEntryName.SimpleMemoryKeyValueInternal) {
      throw new Error(`Could not find key value config at ${[...path, 'internal'].join('/')}`);
    }

    if (!internalConfig.processId) {
      throw new Error('KeyValueDatastore internal config is not ready yet');
    }

    const keyValueDatastore = this.processManager.getProcessByIdAs(internalConfig.processId, KEY_VALUE_DATASTORE_FLAG);
    if (!keyValueDatastore) {
      throw new Error(`Could not find compatible datastore process with id ${internalConfig.processId} and path ${path.join('/')}`);
    }

    return keyValueDatastore.get(key);
  }

  async drop(path: FullyQualifiedPath, key: string): Promise<void> {
    const config = await this.metadataDispatcher.getEntry(path);
    if (!config || config.name !== ConfigEntryName.SimpleMemoryKeyValue) {
      throw new Error(`Could not find key value config at ${path.join('/')}`);
    }

    const internalConfig = await this.metadataDispatcher.getEntry([...path, 'internal']);
    if (!internalConfig || internalConfig.name !== ConfigEntryName.SimpleMemoryKeyValueInternal) {
      throw new Error(`Could not find key value config at ${[...path, 'internal'].join('/')}`);
    }

    if (!internalConfig.processId) {
      throw new Error('KeyValueDatastore internal config is not ready yet');
    }

    const keyValueDatastore = this.processManager.getProcessByIdAs(internalConfig.processId, KEY_VALUE_DATASTORE_FLAG);
    if (!keyValueDatastore) {
      throw new Error(`Could not find compatible datastore process with id ${internalConfig.processId} and path ${path.join('/')}`);
    }

    keyValueDatastore.drop(key);
  }
}
