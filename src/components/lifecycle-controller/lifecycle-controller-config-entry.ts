
import { BaseConfigEntry, FullyQualifiedPath } from '../../config/scaffolding/config';

export class LifecycleControllerConfigEntry implements BaseConfigEntry {
  constructor(
    public readonly id: FullyQualifiedPath,
    public readonly initialStorage: FullyQualifiedPath,
    public readonly secondaryStorage: FullyQualifiedPath,
    public readonly age: number,
  ) {}
}
