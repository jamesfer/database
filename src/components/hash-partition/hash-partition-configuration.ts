import { ComponentConfiguration } from '../scaffolding/component-configuration';
import { ComponentName } from '../scaffolding/component-name';
import { ComponentConfigurationWithFacades } from '../scaffolding/all-components-lookup';
import { DISTRIBUTED_OPERATOR_FACADE_NAME } from '../../facades/distributed-operator-facade';
import { EQUALS_FACADE_NAME } from '../../facades/equals-facade';
import { SERIALIZABLE_FACADE_FLAG } from '../../facades/serializable-facade';

export class HashPartitionConfiguration implements ComponentConfiguration<ComponentName.HashPartition> {
  readonly NAME = ComponentName.HashPartition;

  constructor(
    public readonly partitionsCount: number,
    public readonly nestedConfig: ComponentConfigurationWithFacades<EQUALS_FACADE_NAME | DISTRIBUTED_OPERATOR_FACADE_NAME | SERIALIZABLE_FACADE_FLAG>,
  ) {}
}
