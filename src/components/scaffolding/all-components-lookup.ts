import { Component } from './component';
import { ComponentName } from './component-name';
import {
  SimpleInMemoryKeyValueComponent
} from '../simple-memory-key-value-datastore/simple-in-memory-key-value-component';
import { EQUALS_FACADE_NAME } from '../../facades/equals-facade';
import {
  SimpleInMemoryKeyValueInternalComponent
} from '../simple-memory-key-value-datastore/simple-in-memory-key-value-internal-component';
import { assertExtends } from '../../utils/assert-extends';
import { HashPartitionComponent } from '../hash-partition/hash-partition-component';
import { Refine } from '../../types/refine';
import { AllFacades } from '../../facades/scaffolding/all-facades';
import { HashPartitionInternalComponent } from '../hash-partition/hash-partition-internal-component';
import { SERIALIZABLE_FACADE_FLAG } from '../../facades/serializable-facade';

type AllComponentsLookupRestrictionType = { [N in ComponentName]: Component<N, any, EQUALS_FACADE_NAME | SERIALIZABLE_FACADE_FLAG> };

// The assertExtends function is required in Typescript 4.8. Typescript 4.9 has the new satisfies operator which
// does the same thing
export const AllComponentsLookup = assertExtends<AllComponentsLookupRestrictionType>()({
  [ComponentName.SimpleMemoryKeyValue]: SimpleInMemoryKeyValueComponent,
  [ComponentName.SimpleMemoryKeyValueInternal]: SimpleInMemoryKeyValueInternalComponent,
  [ComponentName.HashPartition]: HashPartitionComponent,
  [ComponentName.HashPartitionInternal]: HashPartitionInternalComponent,
});

export type AllComponentsLookup = typeof AllComponentsLookup;

export type ComponentConfigurationType<C extends Component<any, any, any>> = C extends Component<any, infer T, any> ? T : never;

// Compile time type checking of component facades
export type ComponentWithFacades<F extends keyof AllFacades<any>> =
  Refine<AllComponentsLookup[ComponentName], Component<any, any, F>>

export type ComponentConfigurationWithFacades<F extends keyof AllFacades<any>> =
  ComponentConfigurationType<ComponentWithFacades<F>>;

// Runtime type checking of component facades
export function componentImplements<F extends keyof AllFacades<any>>(
  facades: F[],
  component: AllComponentsLookup[ComponentName],
): component is ComponentWithFacades<F> {
  return facades.every(facade => facade in component.FACADES);
}

export function componentConfigurationImplements<F extends keyof AllFacades<any>>(
  facades: F[],
  componentConfig: ComponentConfigurationType<AllComponentsLookup[ComponentName]>,
): componentConfig is ComponentConfigurationWithFacades<F> {
  const component = AllComponentsLookup[componentConfig.NAME];
  return componentImplements(facades, component);
}
