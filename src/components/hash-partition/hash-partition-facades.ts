import { EQUALS_FACADE_NAME } from '../../facades/equals-facade';
import { DISTRIBUTED_OPERATOR_FACADE_NAME } from '../../facades/distributed-operator-facade';
import { AllFacades } from '../../facades/scaffolding/all-facades';
import { HashPartitionConfiguration } from './hash-partition-configuration';
import { hashPartitionEqualsFacade } from './hash-partition-facades/equals';
import { hashPartitionDistributedOperatorFacade } from './hash-partition-facades/distributed-operator';
import { KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME } from '../../facades/key-value-config-request-handler';
import { hashPartitionKeyValueRouter } from './hash-partition-facades/key-value-router';
import { SERIALIZABLE_FACADE_FLAG } from '../../facades/serializable-facade';
import { hashPartitionSerializableFacade } from './hash-partition-facades/serializable';

export type HashPartitionFacadeNames =
  | EQUALS_FACADE_NAME
  | DISTRIBUTED_OPERATOR_FACADE_NAME
  | SERIALIZABLE_FACADE_FLAG
  | KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME;

export type HashPartitionFacades = Pick<AllFacades<HashPartitionConfiguration>, HashPartitionFacadeNames>;

export const HashPartitionFacades: HashPartitionFacades = {
  [EQUALS_FACADE_NAME]: hashPartitionEqualsFacade,
  [DISTRIBUTED_OPERATOR_FACADE_NAME]: hashPartitionDistributedOperatorFacade,
  [KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME]: hashPartitionKeyValueRouter,
  [SERIALIZABLE_FACADE_FLAG]: hashPartitionSerializableFacade,
};
