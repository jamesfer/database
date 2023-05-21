import { EQUALS_FACADE_NAME, EqualsFacade } from '../../../../facades/equals-facade';
import { HashPartitionConfiguration } from '../hash-partition-configuration';
import { getFacade } from '../../../scaffolding/component-utils';

export const hashPartitionEqualsFacade: EqualsFacade<HashPartitionConfiguration> = {
  equals(self: HashPartitionConfiguration, other: HashPartitionConfiguration): boolean {
    if (self.partitionsCount !== other.partitionsCount || self.nested.config.NAME !== other.nested.config.NAME) {
      return false;
    }

    const equalsFacade = getFacade(self.nested.config.NAME, EQUALS_FACADE_NAME);

    // The type casts are required to satisfy Typescript. We confirmed that the two entries are the same type
    // in the above if condition.
    return equalsFacade.equals(self.nested.config as any, other.nested.config as any);
  }
}
