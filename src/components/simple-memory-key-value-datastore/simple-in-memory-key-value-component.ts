import { SimpleInMemoryKeyValueConfiguration } from './simple-in-memory-key-value-configuration';
import { Component } from '../scaffolding/component';
import { ComponentName } from '../scaffolding/component-name';
import { SimpleInMemoryKeyValueFacadeNames, SimpleInMemoryKeyValueFacades } from './simple-in-memory-key-value-facades';

export type SimpleInMemoryKeyValueComponent = Component<
  ComponentName.SimpleMemoryKeyValue,
  SimpleInMemoryKeyValueConfiguration,
  SimpleInMemoryKeyValueFacadeNames
>;

export const SimpleInMemoryKeyValueComponent: SimpleInMemoryKeyValueComponent = {
  NAME: ComponentName.SimpleMemoryKeyValue,
  FACADES: SimpleInMemoryKeyValueFacades,
}
