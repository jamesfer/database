import { Component } from '../scaffolding/component';
import { ComponentName } from '../scaffolding/component-name';
import { HashPartitionInternalConfiguration } from './hash-partition-internal-configuration';
import { HashPartitionInternalFacadeNames, HashPartitionInternalFacades } from './hash-partition-internal-facades';

export type HashPartitionInternalComponent = Component<
  ComponentName.HashPartitionInternal,
  HashPartitionInternalConfiguration,
  HashPartitionInternalFacadeNames
>;

export const HashPartitionInternalComponent: HashPartitionInternalComponent = {
  NAME: ComponentName.HashPartitionInternal,
  FACADES: HashPartitionInternalFacades,
}
