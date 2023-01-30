import { SerializableFacade } from '../../../facades/serializable-facade';
import { HashPartitionInternalConfiguration } from '../hash-partition-internal-configuration';
import { ComponentName } from '../../scaffolding/component-name';

export const hashPartitionInternalSerializableFacade: SerializableFacade<HashPartitionInternalConfiguration> = {
  serialize(object: HashPartitionInternalConfiguration): string {
    return JSON.stringify({
      name: ComponentName.HashPartitionInternal,
      partitionDetails: object.partitionDetails,
    });
  },
  deserialize(string: string): HashPartitionInternalConfiguration | undefined {
    const json = JSON.parse(string);
    if (json.name !== ComponentName.HashPartitionInternal) {
      return;
    }
    return new HashPartitionInternalConfiguration(json.partitionDetails);
  }
};
