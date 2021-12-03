import { ResourceRegistry } from '../../core';
import { SortedArrayDataset } from '../../types/config';
import { SortedArrayResources } from './resources';
import { SortedArrayStore } from './store';
import { Bound } from './types/bound';

export async function putEntry(
  config: SortedArrayDataset,
  resourceRegistry: ResourceRegistry,
): Promise<void> {
  resourceRegistry.registerResources('sortedArray', config.id.join('/'), {
    store: new SortedArrayStore(),
  });
}

export async function put(
  config: SortedArrayDataset,
  resources: SortedArrayResources,
  key: string,
  id: string,
  body: ArrayBuffer,
): Promise<void> {
  resources.store.put(key, id, body);
}

export async function getAll(
  config: SortedArrayDataset,
  resources: SortedArrayResources,
  key: string,
): Promise<ArrayBuffer[]> {
  return resources.store.getAll(key);
}

export async function getInRange(
  config: SortedArrayDataset,
  resources: SortedArrayResources,
  lowerBound: Bound<{ key: string }>,
  upperBound: Bound<{ key: string }>,
): Promise<ArrayBuffer[]> {
  return resources.store.getInRange(lowerBound, upperBound);
}

export async function drop(
  config: SortedArrayDataset,
  resources: SortedArrayResources,
  key: string,
  id: string,
): Promise<void> {
  resources.store.drop(key, id);
}
