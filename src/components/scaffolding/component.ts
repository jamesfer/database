import { ComponentConfiguration } from './component-configuration';
import { AllFacades } from '../../facades/scaffolding/all-facades';
import { ComponentName } from './component-name';
import { AllComponentConfigurations } from './all-component-configurations';

export interface Component<
  Name extends ComponentName,
  Configuration extends AllComponentConfigurations & ComponentConfiguration<Name>,
  FacadeKeys extends keyof AllFacades<Configuration>,
> {
  readonly NAME: Name;
  readonly FACADES: Pick<AllFacades<Configuration>, FacadeKeys>;
}
