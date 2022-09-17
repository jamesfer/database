import { FullyQualifiedPath } from '../../config/config';
import { BaseConfigEntry } from '../../config/base-config-entry';
import { ConfigEntryName } from '../../config/config-entry-name';

export class MetadataGroupEntry extends BaseConfigEntry<ConfigEntryName.MetadataGroup> {
  constructor() {
    super(ConfigEntryName.MetadataGroup);
  }

  equals(other: this): boolean {
    return true;
  }
}
