import { BaseConfigEntry } from '../../config/base-config-entry';
import { ConfigEntryName } from '../../config/config-entry-name';

export class SimpleMemoryKeyValueEntry extends BaseConfigEntry<ConfigEntryName.SimpleMemoryKeyValue> {
  constructor() {
    super(ConfigEntryName.SimpleMemoryKeyValue);
  }

  equals(other: this): boolean {
    return true;
  }
}
