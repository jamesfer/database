import { ProcessManager } from '../process-manager';
import { KEY_VALUE_DATASTORE_FLAG } from '../../facades/key-value-datastore';
import { MetadataDispatcherFacade } from '../../facades/metadata-dispatcher-facade';
import { RPCInterface } from '../../types/rpc-interface';
import { ConfigEntryName, FullyQualifiedPath } from '../../config/scaffolding/config';

export class KeyValueApi {
  public static async initialize(
    nodeId: string,
    metadataDispatcher: MetadataDispatcherFacade,
    processManager: ProcessManager,
    rcpInterface: RPCInterface,
  ): Promise<KeyValueApi> {
    return new KeyValueApi(nodeId, metadataDispatcher, processManager, rcpInterface);
  }

  private constructor(
    private readonly nodeId: string,
    private readonly metadataDispatcher: MetadataDispatcherFacade,
    private readonly processManager: ProcessManager,
    private readonly rpcInterface: RPCInterface,
  ) {}

  async put(path: FullyQualifiedPath, key: string, value: ArrayBuffer): Promise<void> {
    const internalConfig = await this.metadataDispatcher.getEntryAs(
      [...path, 'internal'],
      ConfigEntryName.SimpleMemoryKeyValueInternal,
    );
    if (!internalConfig.remoteProcess) {
      throw new Error('KeyValueDatastore internal config is not ready yet');
    }

    await this.rpcInterface.makeRequestOnProcess(
      internalConfig.remoteProcess.nodeId,
      internalConfig.remoteProcess.processId,
      'something',
    );
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
