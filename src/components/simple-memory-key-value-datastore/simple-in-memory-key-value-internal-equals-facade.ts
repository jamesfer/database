import { EqualsFacade } from '../../facades/equals-facade';
import { SimpleInMemoryKeyValueConfiguration } from './simple-in-memory-key-value-configuration';
import { SimpleInMemoryKeyValueInternalConfiguration } from './simple-in-memory-key-value-internal-configuration';

export const simpleInMemoryKeyValueInternalEqualsFacade: EqualsFacade<SimpleInMemoryKeyValueInternalConfiguration> = {
  equals(self: SimpleInMemoryKeyValueInternalConfiguration, other: SimpleInMemoryKeyValueInternalConfiguration): boolean {
    return self.remoteProcess?.processId == other.remoteProcess?.processId
      && self.remoteProcess?.nodeId == other.remoteProcess?.nodeId;
  }
}
