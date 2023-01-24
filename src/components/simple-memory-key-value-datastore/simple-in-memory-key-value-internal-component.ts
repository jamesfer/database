import { Component } from '../scaffolding/component';
import { EQUALS_FACADE_NAME } from '../../facades/equals-facade';
import { ComponentName } from '../scaffolding/component-name';
import { SimpleInMemoryKeyValueInternalConfiguration } from './simple-in-memory-key-value-internal-configuration';
import { SimpleInMemoryKeyValueInternalFacades } from './simple-in-memory-key-value-internal-facades';

export type SimpleInMemoryKeyValueInternalComponent = Component<
  ComponentName.SimpleMemoryKeyValueInternal,
  SimpleInMemoryKeyValueInternalConfiguration,
  EQUALS_FACADE_NAME
>;

export const SimpleInMemoryKeyValueInternalComponent: SimpleInMemoryKeyValueInternalComponent = {
  NAME: ComponentName.SimpleMemoryKeyValueInternal,
  FACADES: SimpleInMemoryKeyValueInternalFacades,
}
