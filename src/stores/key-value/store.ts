export class KeyValueStore {
  private data: { [k: string]: ArrayBuffer } = {};

  put(key: string, value: ArrayBuffer): void {
    this.data[key] = value;
  }

  get(key: string): ArrayBuffer | undefined {
    return this.data[key];
  }

  drop(key: string): void {
    delete this.data[key];
  }
}
