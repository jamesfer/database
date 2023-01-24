import { AnyFacade, AnyFacadeFlag, SelectFacades } from './any-facade';
import { Refine } from '../../types/refine';
import { ConfigEntryName } from '../../config/config-entry-name';
import { ComponentConfiguration } from '../../components/scaffolding/component-configuration';

export function implementsFacades<F extends AnyFacadeFlag>(
  flags: F[],
  value: AnyFacade
): value is Refine<AnyFacade, { [K in F]: true }> {
  // TODO
  return true;
}

export function componentImplementsFacades<F extends AnyFacadeFlag>(
  component: ComponentConfiguration<ConfigEntryName, AnyFacade>,
  flags: F[],
): component is ComponentConfiguration<ConfigEntryName, SelectFacades<F>> {
  return flags.every(flag => (component.facades as any)[flag]);
}
