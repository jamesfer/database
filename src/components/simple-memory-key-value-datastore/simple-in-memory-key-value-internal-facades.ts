import { EQUALS_FACADE_NAME } from '../../facades/equals-facade';
import { SimpleInMemoryKeyValueInternalConfiguration } from './simple-in-memory-key-value-internal-configuration';
import { AllFacades } from '../../facades/scaffolding/all-facades';
import { simpleInMemoryKeyValueInternalEqualsFacade } from './simple-in-memory-key-value-internal-equals-facade';

// export const SimpleInMemoryKeyValueInternalFacades: SimpleInMemoryKeyValueInternalFacades = {
//   [EQUALS_FACADE_NAME]: true,
//   equals: (self, other) => self.remoteProcess?.processId == other.remoteProcess?.processId
//     && self.remoteProcess?.nodeId == self.remoteProcess?.nodeId,
// };


export type SimpleInMemoryKeyValueInternalFacadeNames =
  | EQUALS_FACADE_NAME;

export type SimpleInMemoryKeyValueInternalFacades = Pick<AllFacades<SimpleInMemoryKeyValueInternalConfiguration>, SimpleInMemoryKeyValueInternalFacadeNames>

export const SimpleInMemoryKeyValueInternalFacades: SimpleInMemoryKeyValueInternalFacades = {
  [EQUALS_FACADE_NAME]: simpleInMemoryKeyValueInternalEqualsFacade,
};
