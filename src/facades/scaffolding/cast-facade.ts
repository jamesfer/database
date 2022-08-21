import { BaseFacade, FACADES_KEY } from './base-facade';
import { FacadeDictionary, FacadeDictionaryKey } from './facade-dictionary';

export function castFacade<F extends FacadeDictionaryKey>(instance: BaseFacade, flag: F): FacadeDictionary[F] | undefined {
  // A type case is required here because Typescript can't convert
  // Partial<FacadeMapping, F> to FacadeMapping[F] | undefined
  return instance[FACADES_KEY][flag] as FacadeDictionary[F] | undefined;
}
