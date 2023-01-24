import { EqualsFacade } from '../../facades/equals-facade';
import { SimpleInMemoryKeyValueConfiguration } from './simple-in-memory-key-value-configuration';

export const simpleInMemoryKeyValueEqualsFacade: EqualsFacade<SimpleInMemoryKeyValueConfiguration> = {
  equals(self: SimpleInMemoryKeyValueConfiguration, other: SimpleInMemoryKeyValueConfiguration): boolean {
    return true;
  }
}
