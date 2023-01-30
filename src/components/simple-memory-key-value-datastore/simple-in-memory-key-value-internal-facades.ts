import { EQUALS_FACADE_NAME } from '../../facades/equals-facade';
import { SimpleInMemoryKeyValueInternalConfiguration } from './simple-in-memory-key-value-internal-configuration';
import { AllFacades } from '../../facades/scaffolding/all-facades';
import { simpleInMemoryKeyValueInternalEqualsFacade } from './simple-in-memory-key-value-internal-equals-facade';
import { SERIALIZABLE_FACADE_FLAG } from '../../facades/serializable-facade';
import {
  simpleInMemoryKeyValueInternalSerializableFacade
} from './simple-in-memory-key-value-internal-serializable-facade';

export type SimpleInMemoryKeyValueInternalFacadeNames =
  | EQUALS_FACADE_NAME
  | SERIALIZABLE_FACADE_FLAG;

export type SimpleInMemoryKeyValueInternalFacades = Pick<AllFacades<SimpleInMemoryKeyValueInternalConfiguration>, SimpleInMemoryKeyValueInternalFacadeNames>

export const SimpleInMemoryKeyValueInternalFacades: SimpleInMemoryKeyValueInternalFacades = {
  [EQUALS_FACADE_NAME]: simpleInMemoryKeyValueInternalEqualsFacade,
  [SERIALIZABLE_FACADE_FLAG]: simpleInMemoryKeyValueInternalSerializableFacade,
};
