import { ConfigEntry } from './config-entry';

export type FullyQualifiedPath = string[];

export class ConfigFolderItem {
  constructor(
    public readonly item: ConfigEntry,
    public readonly children: ConfigFolder,
  ) {
  }
}

export class ConfigFolder {
  constructor(
    public readonly entries: { [k: string]: ConfigFolderItem },
  ) {
  }
}

export class Config {
  public static empty(): Config {
    return new Config(new ConfigFolder({}));
  }

  constructor(
    public readonly rootFolder: ConfigFolder,
  ) {
  }
}
