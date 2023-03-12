import { EQUALS_FACADE_NAME } from '../../../facades/equals-facade';
import { AllFacades } from '../../../facades/scaffolding/all-facades';
import { HashPartitionInternalConfiguration } from './hash-partition-internal-configuration';
import { hashPartitionInternalEqualsFacade } from './facade-implementations/equals';
import { SERIALIZABLE_FACADE_FLAG } from '../../../facades/serializable-facade';
import { hashPartitionInternalSerializableFacade } from './facade-implementations/serializable';

export type HashPartitionInternalFacadeNames =
  | EQUALS_FACADE_NAME
  | SERIALIZABLE_FACADE_FLAG;

export type HashPartitionInternalFacades = Pick<AllFacades<HashPartitionInternalConfiguration>, HashPartitionInternalFacadeNames>;

export const HashPartitionInternalFacades: HashPartitionInternalFacades = {
  [EQUALS_FACADE_NAME]: hashPartitionInternalEqualsFacade,
  [SERIALIZABLE_FACADE_FLAG]: hashPartitionInternalSerializableFacade,
}
