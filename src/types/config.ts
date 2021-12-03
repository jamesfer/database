export type FullyQualifiedPath = string[];

export interface BaseConfigEntry {
  /**
   * Fully qualified path of the entry
   */
  readonly id: FullyQualifiedPath;
}

export class KeyValueDataset implements BaseConfigEntry {
  constructor(
    public readonly id: FullyQualifiedPath,
  ) {}
}

export class SortedArrayDataset implements BaseConfigEntry {
  constructor(
    public readonly id: FullyQualifiedPath,
  ) {}
}

export class RestApi implements BaseConfigEntry {
  constructor(
    public readonly id: FullyQualifiedPath,
    public readonly dataset: FullyQualifiedPath,
  ) {}
}

export class FolderEntry implements BaseConfigEntry {
  constructor(
    public readonly id: FullyQualifiedPath,
  ) {}
}

export type ConfigEntry =
  | KeyValueDataset
  | SortedArrayDataset
  | RestApi
  | FolderEntry;

export class Config {
  constructor(public readonly entries: { [k: string]: ConfigEntry }) {}
}
