import { FacadeFlagMap, FacadeFlagMapKey } from './facade-flag-map';

export const FACADE_FLAGS: unique symbol = Symbol('FACADE_FLAGS');

export type FACADE_FLAGS = typeof FACADE_FLAGS;

export interface BaseFacade {
  readonly [FACADE_FLAGS]: Partial<FacadeFlagMap>;
}

export interface WithFacadeFlag<T extends FacadeFlagMapKey> {
  readonly [FACADE_FLAGS]: Pick<FacadeFlagMap, T>;
}
