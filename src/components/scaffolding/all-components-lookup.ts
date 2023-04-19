import { Component } from './component';
import { ComponentName } from './component-name';
import {
  SimpleInMemoryKeyValueComponent
} from '../simple-memory-key-value-datastore/simple-in-memory-key-value-component';
import { EQUALS_FACADE_NAME } from '../../facades/equals-facade';
import {
  SimpleInMemoryKeyValueInternalComponent
} from '../simple-memory-key-value-datastore/simple-in-memory-key-value-internal-component';
import { HashPartitionComponent } from '../hash-partition/main-component/hash-partition-component';
import { Refine } from '../../types/refine';
import { AllFacades } from '../../facades/scaffolding/all-facades';
import { HashPartitionInternalComponent } from '../hash-partition/internal-component/hash-partition-internal-component';
import { SERIALIZABLE_FACADE_FLAG } from '../../facades/serializable-facade';
import { TransformationRunnerComponent } from '../transformation-runner/main-component/transformation-runner-component';
import {
  TransformationRunnerInternalComponent
} from '../transformation-runner/internal-component/transformation-runner-internal-component';
import { JsonLinesRowBlockComponent } from '../json-lines-row-block/main-component/json-lines-row-block-component';
import {
  JsonLinesRowBlockInternalComponent
} from '../json-lines-row-block/internal-component/json-lines-row-block-internal-component';

type AllComponentsLookupRestrictionType = { [N in ComponentName]: Component<N, any, EQUALS_FACADE_NAME | SERIALIZABLE_FACADE_FLAG> };

export const AllComponentsLookup = {
  [ComponentName.SimpleMemoryKeyValue]: SimpleInMemoryKeyValueComponent,
  [ComponentName.SimpleMemoryKeyValueInternal]: SimpleInMemoryKeyValueInternalComponent,
  [ComponentName.HashPartition]: HashPartitionComponent,
  [ComponentName.HashPartitionInternal]: HashPartitionInternalComponent,
  [ComponentName.TransformationRunner]: TransformationRunnerComponent,
  [ComponentName.TransformationRunnerInternal]: TransformationRunnerInternalComponent,
  [ComponentName.JsonLinesRowBlock]: JsonLinesRowBlockComponent,
  [ComponentName.JsonLinesRowBlockInternal]: JsonLinesRowBlockInternalComponent,
} satisfies AllComponentsLookupRestrictionType;

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
