import { ProcessManager } from '../process-manager';
import { FullyQualifiedPath } from '../../types/config';
import { KEY_VALUE_DATASTORE_FLAG } from '../../facades/key-value-datastore';

export class KeyValueApi {
  public static async initialize(
    nodeId: string,
    processManager: ProcessManager,
  ): Promise<KeyValueApi> {
    return new KeyValueApi(nodeId, processManager);
  }

  private constructor(
    private readonly nodeId: string,
    private readonly processManager: ProcessManager,
  ) {}

  async put(path: FullyQualifiedPath, key: string, value: ArrayBuffer): Promise<void> {
    const keyValueDatastore = this.processManager.getProcessByPathAs(path, KEY_VALUE_DATASTORE_FLAG);
    if (!keyValueDatastore) {
      throw new Error('Could not find compatible datastore at ' + path.join('/'));
    }

    keyValueDatastore.put(key, value);
  }

  async get(path: FullyQualifiedPath, key: string): Promise<ArrayBuffer | undefined> {
    const keyValueDatastore = this.processManager.getProcessByPathAs(path, KEY_VALUE_DATASTORE_FLAG);
    if (!keyValueDatastore) {
      throw new Error('Could not find compatible datastore at ' + path.join('/'));
    }

    return keyValueDatastore.get(key);
  }

  async drop(path: FullyQualifiedPath, key: string): Promise<void> {
    const keyValueDatastore = this.processManager.getProcessByPathAs(path, KEY_VALUE_DATASTORE_FLAG);
    if (!keyValueDatastore) {
      throw new Error('Could not find compatible datastore at ' + path.join('/'));
    }

    keyValueDatastore.drop(key);
  }
}
