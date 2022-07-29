import { BaseFacade, FACADE_FLAGS } from './base-facade';
import { FacadeFlagMap, FacadeFlagMapKey } from './facade-flag-map';

export function castFacade<F extends FacadeFlagMapKey>(instance: BaseFacade, flag: F): FacadeFlagMap[F] | undefined {
  // A type case is required here because Typescript can't convert
  // Partial<FacadeFlagMap, F> to FacadeFlagMap[F] | undefined
  return instance[FACADE_FLAGS][flag] as FacadeFlagMap[F] | undefined;
}
