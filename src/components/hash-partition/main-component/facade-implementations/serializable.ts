import { SERIALIZABLE_FACADE_FLAG, SerializableFacade } from '../../../../facades/serializable-facade';
import { HashPartitionConfiguration } from '../hash-partition-configuration';
import { ComponentName } from '../../../scaffolding/component-name';
import {
  AllComponentsLookup,
  ComponentConfigurationWithFacades,
  componentConfigurationImplements
} from '../../../scaffolding/all-components-lookup';
import { assert } from '../../../../utils/assert';
import { AllComponentConfigurations } from '../../../scaffolding/all-component-configurations';
import { EQUALS_FACADE_NAME } from '../../../../facades/equals-facade';
import { DISTRIBUTED_OPERATOR_FACADE_NAME } from '../../../../facades/distributed-operator-facade';

export const hashPartitionSerializableFacade: SerializableFacade<HashPartitionConfiguration> = {
  serialize(object: HashPartitionConfiguration): string {
    const nestedConfigSerializer: SerializableFacade<AllComponentConfigurations> | undefined = AllComponentsLookup[object.nested.config.NAME].FACADES[SERIALIZABLE_FACADE_FLAG];
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
    const nestedConfigName = json.nestedConfigName as ComponentConfigurationWithFacades<SERIALIZABLE_FACADE_FLAG>['NAME'];
    const nestedConfigSerializer: SerializableFacade<AllComponentConfigurations> | undefined = AllComponentsLookup[nestedConfigName].FACADES[SERIALIZABLE_FACADE_FLAG];
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
