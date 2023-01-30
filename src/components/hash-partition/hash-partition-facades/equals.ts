import { EQUALS_FACADE_NAME, EqualsFacade } from '../../../facades/equals-facade';
import { HashPartitionConfiguration } from '../hash-partition-configuration';
import { AllComponentsLookup } from '../../scaffolding/all-components-lookup';

export const hashPartitionEqualsFacade: EqualsFacade<HashPartitionConfiguration> = {
  equals(self: HashPartitionConfiguration, other: HashPartitionConfiguration): boolean {
    if (self.partitionsCount !== other.partitionsCount || self.nestedConfig.NAME !== other.nestedConfig.NAME) {
      return false;
    }

    const equalsFacade = AllComponentsLookup[self.nestedConfig.NAME].FACADES[EQUALS_FACADE_NAME];

    // The type casts are required to satisfy Typescript. We confirmed that the two entries are the same type
    // in the above if condition.
    return equalsFacade.equals(self.nestedConfig as any, other.nestedConfig as any);
  }
}
