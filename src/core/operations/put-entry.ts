import { ConfigEntry } from '../../types/config';
import { MetadataState } from '../metadata-state/metadata-state';

export function putEntry(metadata: MetadataState, entry: ConfigEntry): void {
  metadata.publish(entry);
}
