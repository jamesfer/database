import { ConfigEntry, FullyQualifiedPath } from '../../types/config';
import { MetadataState } from '../metadata-state';

export default function getEntry(metadata: MetadataState, path: FullyQualifiedPath): ConfigEntry | undefined {
  return metadata.configEntryAt(path);
}
