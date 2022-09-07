import { BaseConfigEntry, ConfigEntryName, FullyQualifiedPath } from '../../config/scaffolding/config';

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
