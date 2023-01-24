import { ConfigEntryName } from './config-entry-name';
import { Refine } from '../types/refine';
import {
  SimpleInMemoryKeyValueConfiguration
} from '../components/simple-memory-key-value-datastore/simple-in-memory-key-value-configuration';
import {
  SimpleInMemoryKeyValueInternalConfiguration
} from '../components/simple-memory-key-value-datastore/simple-in-memory-key-value-internal-configuration';
import { assertExtends } from '../utils/assert-extends';
import { ComponentConfiguration } from '../components/scaffolding/component-configuration';
import { EqualsFacade } from '../facades/equals-facade';

export type ConfigEntry =
  | SimpleInMemoryKeyValueConfiguration
  | SimpleInMemoryKeyValueInternalConfiguration;
  // | HashPartitionEntry
  // | HashPartitionInternalEntry;

export type SelectConfigEntry<T extends ConfigEntryName> = Refine<ConfigEntry, { name: T }>;
