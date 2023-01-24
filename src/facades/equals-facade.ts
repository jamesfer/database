import { AllComponentConfigurations } from '../components/scaffolding/all-component-configurations';

export const EQUALS_FACADE_NAME = 'EQUALS_FACADE' as const;

export type EQUALS_FACADE_NAME = typeof EQUALS_FACADE_NAME;

export interface EqualsFacade<C> {
  equals(self: C, other: C): boolean;
}

declare module './scaffolding/all-facades' {
  export interface AllFacades<C extends AllComponentConfigurations> {
    [EQUALS_FACADE_NAME]: EqualsFacade<C>;
  }
}
