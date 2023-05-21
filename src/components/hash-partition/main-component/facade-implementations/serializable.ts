import { SERIALIZABLE_FACADE_FLAG, SerializableFacade } from '../../../../facades/serializable-facade';
import { HashPartitionConfiguration } from '../hash-partition-configuration';
import { ComponentName } from '../../../scaffolding/component-name';
import { assert } from '../../../../utils/assert';
import { AllComponentConfigurations } from '../../../scaffolding/all-component-configurations';
import { EQUALS_FACADE_NAME } from '../../../../facades/equals-facade';
import { DISTRIBUTED_OPERATOR_FACADE_NAME } from '../../../../facades/distributed-operator-facade';
import {
  componentConfigurationImplements, getFacade,
  RefineComponentNameByFacades
} from '../../../scaffolding/component-utils';
import { AllComponentsLookup } from '../../../scaffolding/all-components-lookup';

export const hashPartitionSerializableFacade: SerializableFacade<HashPartitionConfiguration> = {
  serialize(object: HashPartitionConfiguration): string {
    const nestedConfigSerializer = getFacade(object.nested.config.NAME, SERIALIZABLE_FACADE_FLAG);
    assert(nestedConfigSerializer, 'Cannot serialize hash partition as nested config is not serializable');

    return JSON.stringify({
      name: ComponentName.HashPartition,
      partitionCount: object.partitionsCount,
      nestedConfigName: object.nested.config.NAME,
      nestedConfig: nestedConfigSerializer.serialize(object.nested.config),
    });
  },
  deserialize(string: string): HashPartitionConfiguration | undefined {
    const json = JSON.parse(string);
    if (json.name !== ComponentName.HashPartition) {
      return;
    }

    const nestedConfigSerializer = getFacade(json.nestedConfigName, SERIALIZABLE_FACADE_FLAG);
    assert(nestedConfigSerializer, 'Cannot deserialize hash partition as nested config is not serializable');

    const config = nestedConfigSerializer.deserialize(json.nestedConfig);
    assert(config, 'Failed to deserialize nested config');
    assert(
      componentConfigurationImplements([SERIALIZABLE_FACADE_FLAG, EQUALS_FACADE_NAME, DISTRIBUTED_OPERATOR_FACADE_NAME], config),
      'Nested config of a hash partition must implement the equals, serializable, and distributed operator facades',
    );

    return new HashPartitionConfiguration(json.partitionCount, { config });
  }
};
