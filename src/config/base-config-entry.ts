import { FullyQualifiedPath } from './config';
import { ConfigEntryName } from './config-entry-name';

export abstract class BaseConfigEntry<T extends ConfigEntryName> {
  protected constructor(
    public readonly name: T,
    public readonly id: FullyQualifiedPath,
  ) {
  }

  abstract equals(other: this): boolean;
}
