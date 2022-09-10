import { FullyQualifiedPath } from '../../config/config';
import { BaseConfigEntry } from '../../config/base-config-entry';
import { ConfigEntryName } from '../../config/config-entry-name';

export class MetadataGroupEntry extends BaseConfigEntry<ConfigEntryName.MetadataGroup> {
  constructor(id: FullyQualifiedPath) {
    super(ConfigEntryName.MetadataGroup, id);
  }

  equals(other: this): boolean {
    return this.id.join('/') === other.id.join('/');
  }
}
