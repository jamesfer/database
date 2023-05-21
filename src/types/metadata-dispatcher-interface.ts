import { FullyQualifiedPath } from '../core/metadata-state/config';
import { ComponentName } from '../components/scaffolding/component-name';
import { AllComponentConfigurations } from '../components/scaffolding/all-component-configurations';
import { Refine } from './refine';
import { AnyComponentConfiguration } from '../components/any-component-configuration';

export interface MetadataDispatcherInterface {
  containsPath(path: FullyQualifiedPath): boolean;
  ownsPath(path: FullyQualifiedPath): boolean;
  getEntry(path: FullyQualifiedPath): Promise<AnyComponentConfiguration | undefined>;
  getEntryAs<N extends AnyComponentConfiguration['name']>(
    path: FullyQualifiedPath,
    name: N,
  ): Promise<Refine<AnyComponentConfiguration, { name: N}>>;
  putEntry(path: FullyQualifiedPath, entry: AnyComponentConfiguration): Promise<void>;
}
