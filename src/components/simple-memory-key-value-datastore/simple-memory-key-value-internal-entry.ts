import { BaseConfigEntry } from '../../config/base-config-entry';
import { ConfigEntryName } from '../../config/config-entry-name';

export class SimpleMemoryKeyValueInternalEntry extends BaseConfigEntry<ConfigEntryName.SimpleMemoryKeyValueInternal> {
  constructor(
    public readonly remoteProcess: { nodeId: string, processId: string } | undefined,
  ) {
    super(ConfigEntryName.SimpleMemoryKeyValueInternal);
  }

  equals(other: this): boolean {
    return this.remoteProcess?.nodeId === other.remoteProcess?.nodeId
      && this.remoteProcess?.processId == other.remoteProcess?.processId;
  }
}
