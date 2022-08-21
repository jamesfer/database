export type FullyQualifiedPath = string[];

export enum ConfigEntryName {
  SimpleMemoryKeyValue = 'SimpleMemoryKeyValue',
  SimpleMemoryKeyValueInternal = 'SimpleMemoryKeyValueInternal',
  SimpleMemoryKeyValueInstance = 'SimpleMemoryKeyValueInstance',
  RestApi = 'RestApi',
  Folder = 'Folder',
  MetadataGroup = 'MetadataGroup',
}

export abstract class BaseConfigEntry<T extends ConfigEntryName> {
  protected constructor(
    public readonly name: T,
    public readonly id: FullyQualifiedPath,
  ) {}

  abstract equals(other: this): boolean;
}
