import { ComponentConfiguration } from '../../scaffolding/component-configuration';
import { ComponentName } from '../../scaffolding/component-name';
import { DISTRIBUTED_OPERATOR_FACADE_NAME } from '../../../facades/distributed-operator-facade';
import { EQUALS_FACADE_NAME } from '../../../facades/equals-facade';
import { SERIALIZABLE_FACADE_FLAG } from '../../../facades/serializable-facade';
import { RefineComponentConfigurationByFacades } from '../../scaffolding/component-utils';

interface HashPartitionNestedConfig {
  config: RefineComponentConfigurationByFacades<
    EQUALS_FACADE_NAME | DISTRIBUTED_OPERATOR_FACADE_NAME | SERIALIZABLE_FACADE_FLAG
  >,
}

export class HashPartitionConfiguration implements ComponentConfiguration {
  readonly NAME = ComponentName.HashPartition;

  constructor(
    public readonly partitionsCount: number,
    public readonly nested: HashPartitionNestedConfig,
  ) {}
}
