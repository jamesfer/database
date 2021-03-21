import { KeyValueResources } from '../stores/key-value/resources';

interface ResourceHKT {
  keyValue: KeyValueResources;
}

// interface ResourceDictionary {
//   keyValue: { [k: string]: KeyValueResources };
// }


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
