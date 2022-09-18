import { HashPartitionProcess } from '../components/hash-partition/hash-partition-process';
import {
  SimpleMemoryKeyValueProcess
} from '../components/simple-memory-key-value-datastore/simple-memory-key-value-process';

export type Process =
  | HashPartitionProcess
  | SimpleMemoryKeyValueProcess;
