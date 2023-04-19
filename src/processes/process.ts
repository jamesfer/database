import { HashPartitionProcess } from '../components/hash-partition/process/hash-partition-process';
import {
  SimpleInMemoryKeyValueProcess
} from '../components/simple-memory-key-value-datastore/simple-in-memory-key-value-process';
import { TransformationRunnerProcess } from '../components/transformation-runner/process/transformation-runner-process';
import { JsonLinesRowBlockProcess } from '../components/json-lines-row-block/process/json-lines-row-block-process';

export type Process =
  | HashPartitionProcess
  | SimpleInMemoryKeyValueProcess
  | TransformationRunnerProcess
  | JsonLinesRowBlockProcess;
