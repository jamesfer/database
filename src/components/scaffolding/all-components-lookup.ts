import { ComponentName } from './component-name';
import { EQUALS_FACADE_NAME } from '../../facades/equals-facade';
import { SERIALIZABLE_FACADE_FLAG } from '../../facades/serializable-facade';
import { AllFacades } from '../../facades/scaffolding/all-facades';
import { AllComponentConfigurations } from './all-component-configurations';
import { Refine } from '../../types/refine';
import { SimpleInMemoryKeyValueFacades } from '../simple-memory-key-value-datastore/simple-in-memory-key-value-facades';
import {
  SimpleInMemoryKeyValueInternalFacades
} from '../simple-memory-key-value-datastore/simple-in-memory-key-value-internal-facades';
import { HashPartitionFacades } from '../hash-partition/main-component/hash-partition-facades';
import { HashPartitionInternalFacades } from '../hash-partition/internal-component/hash-partition-internal-facades';
import { TransformationRunnerFacades } from '../transformation-runner/main-component/transformation-runner-facades';
import {
  TransformationRunnerInternalFacades
} from '../transformation-runner/internal-component/transformation-runner-internal-facades';

type AllComponentsLookupRestrictionType = {
  [N in ComponentName]: Pick<
    AllFacades<Refine<AllComponentConfigurations, { NAME: N }>>,
    EQUALS_FACADE_NAME | SERIALIZABLE_FACADE_FLAG
  >
};

export const AllComponentsLookup = {
  [ComponentName.SimpleMemoryKeyValue]: SimpleInMemoryKeyValueFacades,
  [ComponentName.SimpleMemoryKeyValueInternal]: SimpleInMemoryKeyValueInternalFacades,
  [ComponentName.HashPartition]: HashPartitionFacades,
  [ComponentName.HashPartitionInternal]: HashPartitionInternalFacades,
  [ComponentName.TransformationRunner]: TransformationRunnerFacades,
  [ComponentName.TransformationRunnerInternal]: TransformationRunnerInternalFacades,
} satisfies AllComponentsLookupRestrictionType;

export type AllComponentsLookup = typeof AllComponentsLookup;
