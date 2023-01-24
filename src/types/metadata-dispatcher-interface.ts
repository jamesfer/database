import { FullyQualifiedPath } from '../config/config';
import { ComponentName } from '../components/scaffolding/component-name';
import { AllComponentConfigurations } from '../components/scaffolding/all-component-configurations';
import { Refine } from './refine';

export interface MetadataDispatcherInterface {
  containsPath(path: FullyQualifiedPath): boolean;
  ownsPath(path: FullyQualifiedPath): boolean;
  getEntry(path: FullyQualifiedPath): Promise<AllComponentConfigurations | undefined>;
  getEntryAs<N extends ComponentName>(path: FullyQualifiedPath, name: N): Promise<Refine<AllComponentConfigurations, { NAME: N}>>;
  putEntry(path: FullyQualifiedPath, entry: AllComponentConfigurations): Promise<void>;
}
