import { KeyValueResources } from '../stores/key-value/resources';
import { SortedArrayResources } from '../stores/sorted-array/resources';

interface ResourceHKT {
  keyValue: KeyValueResources;
  sortedArray: SortedArrayResources;
}

interface ResourceDictionary<K extends keyof ResourceHKT> {
  [i: string]: ResourceHKT[K];
}

type ResourceStorage = {
  [K in keyof ResourceHKT]: ResourceDictionary<K>;
}

export class ResourceRegistry {
  private readonly resources: ResourceStorage = { keyValue: {} };

  registerResources<K extends keyof ResourceHKT>(key: K, id: string, resources: ResourceHKT[K]) {
    this.getDictionary(key)[id] = resources;
  }

  getResources<K extends keyof ResourceHKT>(key: K, id: string): ResourceHKT[K] | undefined {
    return this.getDictionary(key)[id];
  }

  private getDictionary<K extends keyof ResourceHKT>(key: K): ResourceDictionary<K> {
    return this.resources[key] as ResourceDictionary<K>;
  }
}
