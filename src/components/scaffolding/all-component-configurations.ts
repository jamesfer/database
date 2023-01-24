import {
  SimpleInMemoryKeyValueConfiguration
} from '../simple-memory-key-value-datastore/simple-in-memory-key-value-configuration';
import {
  SimpleInMemoryKeyValueInternalConfiguration
} from '../simple-memory-key-value-datastore/simple-in-memory-key-value-internal-configuration';

export type AllComponentConfigurations =
  | SimpleInMemoryKeyValueConfiguration
  | SimpleInMemoryKeyValueInternalConfiguration;
