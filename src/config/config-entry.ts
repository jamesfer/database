import {
  SimpleMemoryKeyValueEntry
} from '../components/simple-memory-key-value-datastore/simple-memory-key-value-entry';
import {
  SimpleMemoryKeyValueInternalEntry
} from '../components/simple-memory-key-value-datastore/simple-memory-key-value-internal-entry';
import { MetadataGroupEntry } from '../components/metadata-group/metadata-group-entry';
import { ConfigEntryName } from './config-entry-name';
import { Refine } from '../types/refine';
import { HashPartitionInternalEntry } from '../components/hash-partition/hash-partition-internal-entry';
import { HashPartitionEntry } from '../components/hash-partition/hash-partition-entry';

export type ConfigEntry =
  | SimpleMemoryKeyValueEntry
  | SimpleMemoryKeyValueInternalEntry
  | HashPartitionEntry
  | HashPartitionInternalEntry
  | MetadataGroupEntry;

export type SelectConfigEntry<T extends ConfigEntryName> = Refine<ConfigEntry, { name: T }>;
