import { ConfigEntryName } from './config-entry-name';

export abstract class BaseConfigEntry<T extends ConfigEntryName> {
  protected constructor(
    public readonly name: T,
  ) {
  }

  abstract equals(other: this): boolean;
}
