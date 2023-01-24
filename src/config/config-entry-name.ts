import { AnyFacadeFlag } from '../facades/scaffolding/any-facade';
import { DISTRIBUTED_OPERATOR_FACADE_NAME } from '../facades/distributed-operator-facade';
import { SERIALIZABLE_FACADE_FLAG } from '../facades/serializable-facade';

export enum ConfigEntryName {
  SimpleMemoryKeyValue = 'SimpleMemoryKeyValue',
  SimpleMemoryKeyValueInternal = 'SimpleMemoryKeyValueInternal',
  // HashPartition = 'HashPartition',
  // HashPartitionInternal = 'HashPartitionInternal',
}
