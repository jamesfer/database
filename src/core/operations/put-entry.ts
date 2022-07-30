import { ConfigEntry, SimpleMemoryKeyValueEntry } from '../../types/config';
import { MetadataState } from '../metadata-state';
import { ResourceRegistry } from '../resource-registry';
import { keyValueApi } from '../../stores/key-value/index';

export function putEntry(metadata: MetadataState, resourceRegistry: ResourceRegistry, entry: ConfigEntry): void {
  metadata.publish(entry);

  if (entry instanceof SimpleMemoryKeyValueEntry) {
    keyValueApi.putEntry(entry, resourceRegistry);
  }
}
