import { BaseConfigEntry, ConfigEntryName, FullyQualifiedPath } from '../../config/scaffolding/config';

export class SimpleMemoryKeyValueEntry extends BaseConfigEntry<ConfigEntryName.SimpleMemoryKeyValue> {
  constructor(id: FullyQualifiedPath) {
    super(ConfigEntryName.SimpleMemoryKeyValue, id);
  }

  equals(other: this): boolean {
    return this.id.join('/') === other.id.join('/');
  }
}
