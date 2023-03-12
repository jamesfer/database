import { EQUALS_FACADE_NAME, EqualsFacade } from '../../../../facades/equals-facade';
import { HashPartitionConfiguration } from '../hash-partition-configuration';
import { AllComponentsLookup } from '../../../scaffolding/all-components-lookup';

export const hashPartitionEqualsFacade: EqualsFacade<HashPartitionConfiguration> = {
  equals(self: HashPartitionConfiguration, other: HashPartitionConfiguration): boolean {
    if (self.partitionsCount !== other.partitionsCount || self.nested.config.NAME !== other.nested.config.NAME) {
      return false;
    }

    const equalsFacade = AllComponentsLookup[self.nested.config.NAME].FACADES[EQUALS_FACADE_NAME];

    // The type casts are required to satisfy Typescript. We confirmed that the two entries are the same type
    // in the above if condition.
    return equalsFacade.equals(self.nested.config as any, other.nested.config as any);
  }
}
