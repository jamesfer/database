import { ComponentName } from './component-name';

// export interface ComponentConfiguration<N extends ConfigEntryName, F extends AnyFacade> {
//   readonly name: N;
//   readonly facades: F;
// }

// export abstract class ComponentConfiguration<N extends ConfigEntryName, X = typeof FACADE_LOOKUP[N]> {
//   private readonly facades: X = undefined as any;
//
//   abstract readonly name: N;
// }

export interface ComponentConfiguration<N extends ComponentName> {
  readonly NAME: N;
}
