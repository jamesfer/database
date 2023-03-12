import { Component } from '../../scaffolding/component';
import { ComponentName } from '../../scaffolding/component-name';
import { HashPartitionConfiguration } from './hash-partition-configuration';
import { HashPartitionFacadeNames, HashPartitionFacades } from './hash-partition-facades';

export type HashPartitionComponent = Component<
  ComponentName.HashPartition,
  HashPartitionConfiguration,
  HashPartitionFacadeNames
>;

export const HashPartitionComponent: HashPartitionComponent = {
  NAME: ComponentName.HashPartition,
  FACADES: HashPartitionFacades,
}
