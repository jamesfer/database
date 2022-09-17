import { BaseConfigEntry } from '../../config/base-config-entry';
import { ConfigEntryName } from '../../config/config-entry-name';
import { ConfigEntry } from '../../config/config-entry';

export class HashPartitionEntry extends BaseConfigEntry<ConfigEntryName.HashPartition> {
  constructor(
    public readonly partitionsCount: number,
    public readonly nestedConfig: ConfigEntry,
  ) {
    super(ConfigEntryName.HashPartition);
  }

  equals(other: this): boolean {
    return this.partitionsCount === other.partitionsCount
      && this.nestedConfig.name === other.nestedConfig.name
      && this.nestedConfig.equals(other.nestedConfig as any);
  }
}
