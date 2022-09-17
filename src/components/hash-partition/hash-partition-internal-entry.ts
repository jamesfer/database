import { BaseConfigEntry } from '../../config/base-config-entry';
import { ConfigEntryName } from '../../config/config-entry-name';
import { isEqual } from 'lodash';

export interface HashPartitionDetails {
  nodeId: string;
  processId: string;
}

export class HashPartitionInternalEntry extends BaseConfigEntry<ConfigEntryName.HashPartitionInternal> {
  constructor(
    public readonly partitions: { [k: number]: HashPartitionDetails },
  ) {
    super(ConfigEntryName.HashPartitionInternal);
  }

  equals(other: this): boolean {
    return isEqual(this.partitions, other.partitions);
  }
}
