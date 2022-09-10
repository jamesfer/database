import { FullyQualifiedPath } from '../../config/config';
import { BaseConfigEntry } from '../../config/base-config-entry';
import { ConfigEntryName } from '../../config/config-entry-name';

export class SimpleMemoryKeyValueInternalEntry extends BaseConfigEntry<ConfigEntryName.SimpleMemoryKeyValueInternal> {
  constructor(
    id: FullyQualifiedPath,
    public readonly remoteProcess: { nodeId: string, processId: string } | undefined,
  ) {
    super(ConfigEntryName.SimpleMemoryKeyValueInternal, id);
  }

  equals(other: this): boolean {
    return this.id.join('/') === other.id.join('/')
      && this.remoteProcess?.nodeId === other.remoteProcess?.nodeId
      && this.remoteProcess?.processId == other.remoteProcess?.processId;
  }
}
