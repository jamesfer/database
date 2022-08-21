import { FacadeDictionary, FacadeDictionaryKey } from './facade-dictionary';

export const FACADES_KEY: unique symbol = Symbol('FACADES_KEY');

export type FACADES_KEY = typeof FACADES_KEY;

export interface BaseFacade {
  readonly [FACADES_KEY]: Partial<FacadeDictionary>;
}

export type PickFacades<T extends FacadeDictionaryKey> = Pick<FacadeDictionary, T>;

export interface WithFacadeFlag<T extends FacadeDictionaryKey> {
  readonly [FACADES_KEY]: PickFacades<T>;
}
