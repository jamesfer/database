import { Refine } from './refine';
import { BaseConfigEntry, ConfigEntryName, FullyQualifiedPath } from '../config/scaffolding/config';
import { SimpleMemoryKeyValueEntry } from '../components/simple-memory-key-value-datastore/simple-memory-key-value-entry';

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

export class SimpleMemoryKeyValueInstanceEntry extends BaseConfigEntry<ConfigEntryName.SimpleMemoryKeyValueInstance> {
  constructor(
    id: FullyQualifiedPath,
    public readonly processId: string | undefined,
  ) {
    super(ConfigEntryName.SimpleMemoryKeyValueInstance, id);
  }

  equals(other: this): boolean {
    return this.id.join('/') === other.id.join('/') && this.processId === other.processId;
  }
}

export class RestApiEntry extends BaseConfigEntry<ConfigEntryName.RestApi> {
  constructor(
    id: FullyQualifiedPath,
    public readonly dataset: FullyQualifiedPath,
  ) {
    super(ConfigEntryName.RestApi, id)
  }

  equals(other: this): boolean {
    return this.id.join('/') === other.id.join('/')
      && this.dataset.join('/') === other.dataset.join('/');
  }
}

export class FolderEntry extends BaseConfigEntry<ConfigEntryName.Folder> {
  constructor(id: FullyQualifiedPath) {
    super(ConfigEntryName.Folder, id);
  }

  equals(other: this): boolean {
    return this.id.join('/') === other.id.join('/')
  }
}

export class MetadataGroupEntry extends BaseConfigEntry<ConfigEntryName.MetadataGroup> {
  constructor(
    id: FullyQualifiedPath,
    public readonly groupSize: number,
    public readonly pathPrefix: FullyQualifiedPath,
  ) {
    super(ConfigEntryName.MetadataGroup, id);
  }

  equals(other: this): boolean {
    return this.id.join('/') === other.id.join('/')
      && this.groupSize === other.groupSize
      && this.pathPrefix.join('/') === other.pathPrefix.join('/');
  }
}

export type ConfigEntry =
  | SimpleMemoryKeyValueEntry
  | SimpleMemoryKeyValueInternalEntry
  | SimpleMemoryKeyValueInstanceEntry
  | RestApiEntry
  | FolderEntry
  | MetadataGroupEntry;

export type SelectConfigEntry<T extends ConfigEntryName> = Refine<ConfigEntry, { name: T }>;

export class ConfigFolderItem {
  constructor(
    public readonly item: ConfigEntry,
    public readonly children: ConfigFolder,
  ) {}
}

export class ConfigFolder {
  constructor(
    public readonly entries: { [k: string]: ConfigFolderItem },
  ) {}
}

export class Config {
  public static empty(): Config {
    return new Config(new ConfigFolder({}));
  }

  constructor(
    public readonly rootFolder: ConfigFolder,
  ) {}
}
