import { AllComponentConfigurations } from '../components/scaffolding/all-component-configurations';

export const SERIALIZABLE_FACADE_FLAG = 'SERIALIZABLE_FACADE' as const;

export type SERIALIZABLE_FACADE_FLAG = typeof SERIALIZABLE_FACADE_FLAG;

export interface SerializableFacade<C> {
  serialize(object: C): string;
  deserialize(string: string): C | undefined;
}

declare module './scaffolding/all-facades' {
  export interface AllFacades<C extends AllComponentConfigurations> {
    [SERIALIZABLE_FACADE_FLAG]: SerializableFacade<C>;
  }
}
