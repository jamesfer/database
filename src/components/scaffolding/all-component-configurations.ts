import {
  SimpleInMemoryKeyValueConfiguration
} from '../simple-memory-key-value-datastore/simple-in-memory-key-value-configuration';
import {
  SimpleInMemoryKeyValueInternalConfiguration
} from '../simple-memory-key-value-datastore/simple-in-memory-key-value-internal-configuration';
import { HashPartitionConfiguration } from '../hash-partition/hash-partition-configuration';
import { HashPartitionInternalConfiguration } from '../hash-partition/hash-partition-internal-configuration';

export type AllComponentConfigurations =
  | SimpleInMemoryKeyValueConfiguration
  | SimpleInMemoryKeyValueInternalConfiguration
  | HashPartitionConfiguration
  | HashPartitionInternalConfiguration;
