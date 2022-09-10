import { FullyQualifiedPath } from '../../config/config';
import { BaseConfigEntry } from '../../config/base-config-entry';
import { ConfigEntryName } from '../../config/config-entry-name';

export class SimpleMemoryKeyValueEntry extends BaseConfigEntry<ConfigEntryName.SimpleMemoryKeyValue> {
  constructor(id: FullyQualifiedPath) {
    super(ConfigEntryName.SimpleMemoryKeyValue, id);
  }

  equals(other: this): boolean {
    return this.id.join('/') === other.id.join('/');
  }
}
