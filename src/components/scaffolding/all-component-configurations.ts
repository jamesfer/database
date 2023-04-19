import {
  SimpleInMemoryKeyValueConfiguration
} from '../simple-memory-key-value-datastore/simple-in-memory-key-value-configuration';
import {
  SimpleInMemoryKeyValueInternalConfiguration
} from '../simple-memory-key-value-datastore/simple-in-memory-key-value-internal-configuration';
import { HashPartitionConfiguration } from '../hash-partition/main-component/hash-partition-configuration';
import { HashPartitionInternalConfiguration } from '../hash-partition/internal-component/hash-partition-internal-configuration';
import { TransformationRunnerConfiguration } from '../transformation-runner/main-component/transformation-runner-configuration';
import {
  TransformationRunnerInternalConfiguration
} from '../transformation-runner/internal-component/transformation-runner-internal-configuration';
import {
  JsonLinesRowBlockConfiguration
} from '../json-lines-row-block/main-component/json-lines-row-block-configuration';
import {
  JsonLinesRowBlockInternalConfiguration
} from '../json-lines-row-block/internal-component/json-lines-row-block-internal-configuration';

export type AllComponentConfigurations =
  | SimpleInMemoryKeyValueConfiguration
  | SimpleInMemoryKeyValueInternalConfiguration
  | HashPartitionConfiguration
  | HashPartitionInternalConfiguration
  | TransformationRunnerConfiguration
  | TransformationRunnerInternalConfiguration
  | JsonLinesRowBlockConfiguration
  | JsonLinesRowBlockInternalConfiguration;
