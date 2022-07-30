export type FullyQualifiedPath = string[];

export enum ConfigEntryName {
  SimpleMemoryKeyValue = 'SimpleMemoryKeyValue',
  RestApi = 'RestApi',
  Folder = 'Folder',
  MetadataGroup = 'MetadataGroup',
}

export abstract class BaseConfigEntry<T extends ConfigEntryName> {
  // readonly name: T;
  //
  // /**
  //  * Fully qualified path of the entry
  //  */
  // readonly id: FullyQualifiedPath;

  protected constructor(
    public readonly name: T,
    public readonly id: FullyQualifiedPath,
  ) {}

  abstract equals(other: this): boolean;
}

export class SimpleMemoryKeyValueEntry extends BaseConfigEntry<ConfigEntryName.SimpleMemoryKeyValue> {
  constructor(id: FullyQualifiedPath) {
    super(ConfigEntryName.SimpleMemoryKeyValue, id);
  }

  equals(other: this): boolean {
    return this.id.join('/') === other.id.join('/')
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
  | RestApiEntry
  | FolderEntry
  | MetadataGroupEntry;

type Refine<T, U> = T extends U ? T : never;

export type SelectConfigEntry<T extends ConfigEntryName> = Refine<ConfigEntry, { name: T }>;

export class Config {
  constructor(public readonly entries: { [k: string]: ConfigEntry }) {}
}
