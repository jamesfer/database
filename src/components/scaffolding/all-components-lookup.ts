import { Component } from './component';
import { ComponentName } from './component-name';
import {
  SimpleInMemoryKeyValueComponent
} from '../simple-memory-key-value-datastore/simple-in-memory-key-value-component';
import { EQUALS_FACADE_NAME } from '../../facades/equals-facade';
import {
  SimpleInMemoryKeyValueInternalComponent
} from '../simple-memory-key-value-datastore/simple-in-memory-key-value-internal-component';
import { assertExtends } from '../../utils/assert-extends';

type AllComponentsLookupRestrictionType = { [N in ComponentName]: Component<N, any, EQUALS_FACADE_NAME> };

// The assertExtends function is required in Typescript 4.8. Typescript 4.9 has the new satisfies operator which
// does the same thing
export const AllComponentsLookup = assertExtends<AllComponentsLookupRestrictionType>()({
  [ComponentName.SimpleMemoryKeyValue]: SimpleInMemoryKeyValueComponent,
  [ComponentName.SimpleMemoryKeyValueInternal]: SimpleInMemoryKeyValueInternalComponent,
});

export type AllComponentsLookup = typeof AllComponentsLookup;
