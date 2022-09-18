import { BaseProcess } from '../../processes/base-process';
import { ProcessType } from '../../processes/process-type';

export class SimpleMemoryKeyValueProcess extends BaseProcess<ProcessType.SimpleMemoryKeyValue> {
  public readonly type = ProcessType.SimpleMemoryKeyValue;

  private readonly storage: Map<string, ArrayBuffer> = new Map();

  constructor() {
    super();
  }

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
