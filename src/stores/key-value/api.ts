import { ResourceRegistry } from '../../core';
import { KeyValueDataset } from '../../types/config';
import { KeyValueResources } from './resources';
import { KeyValueStore } from './store';

export async function putEntry(
  config: KeyValueDataset,
  resourceRegistry: ResourceRegistry,
): Promise<void> {
  resourceRegistry.registerResources('keyValue', config.id.join('/'), {
    store: new KeyValueStore(),
  });
}

export async function put(
  config: KeyValueDataset,
  resources: KeyValueResources,
  key: string,
  body: ArrayBuffer,
): Promise<void> {
  resources.store.put(key, body);
}

export async function get(
  config: KeyValueDataset,
  resources: KeyValueResources,
  key: string,
): Promise<ArrayBuffer> {
  const data = resources.store.get(key);
  if (data === undefined) {
    throw `Key ${key} does not exist`;
  }
  return data;
}

export async function drop(
  config: KeyValueDataset,
  resources: KeyValueResources,
  key: string,
): Promise<void> {
  resources.store.drop(key);
}
