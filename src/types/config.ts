export type FullyQualifiedPath = string[];

export enum ConfigEntryName {
  KeyValue = 'KeyValue',
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
}

export class KeyValueDataset extends BaseConfigEntry<ConfigEntryName.KeyValue> {
  constructor(id: FullyQualifiedPath) {
    super(ConfigEntryName.KeyValue, id);
  }
}

export class RestApi extends BaseConfigEntry<ConfigEntryName.RestApi> {
  constructor(
    id: FullyQualifiedPath,
    public readonly dataset: FullyQualifiedPath,
  ) {
    super(ConfigEntryName.RestApi, id)
  }
}

export class FolderEntry extends BaseConfigEntry<ConfigEntryName.Folder> {
  constructor(id: FullyQualifiedPath) {
    super(ConfigEntryName.Folder, id);
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
}

export type ConfigEntry =
  | KeyValueDataset
  | RestApi
  | FolderEntry
  | MetadataGroupEntry;

type Refine<T, U> = T extends U ? T : never;

export type SelectConfigEntry<T extends ConfigEntryName> = Refine<ConfigEntry, { name: T }>;

export class Config {
  constructor(public readonly entries: { [k: string]: ConfigEntry }) {}
}
