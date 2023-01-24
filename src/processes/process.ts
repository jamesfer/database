import { HashPartitionProcess } from '../components/hash-partition/hash-partition-process';
import {
  SimpleInMemoryKeyValueProcess
} from '../components/simple-memory-key-value-datastore/simple-in-memory-key-value-process';

export type Process =
  | HashPartitionProcess
  | SimpleInMemoryKeyValueProcess;
