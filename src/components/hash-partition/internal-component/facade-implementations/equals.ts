import { EqualsFacade } from '../../../../facades/equals-facade';
import { HashPartitionInternalConfiguration } from '../hash-partition-internal-configuration';
import { isEqual } from 'lodash';

export const hashPartitionInternalEqualsFacade: EqualsFacade<HashPartitionInternalConfiguration> = {
  equals(self: HashPartitionInternalConfiguration, other: HashPartitionInternalConfiguration): boolean {
    return isEqual(self.partitionDetails, other.partitionDetails);
  }
}
