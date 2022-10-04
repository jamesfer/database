import { ConfigEntry } from '../../config/config-entry';
import { Codec } from '../../types/codec';
import { assertNever } from '../../utils/assert-never';
import { ConfigEntryName } from '../../config/config-entry-name';
import {
  SimpleMemoryKeyValueEntry
} from '../../components/simple-memory-key-value-datastore/simple-memory-key-value-entry';
import {
  HashPartitionDetails,
  HashPartitionInternalEntry
} from '../../components/hash-partition/hash-partition-internal-entry';
import { HashPartitionEntry } from '../../components/hash-partition/hash-partition-entry';
import {
  SimpleMemoryKeyValueInternalEntry
} from '../../components/simple-memory-key-value-datastore/simple-memory-key-value-internal-entry';

interface SimpleMemoryKeyValueSerializableRepresentation {
  name: ConfigEntryName.SimpleMemoryKeyValue;
}

interface SimpleMemoryKeyValueInternalSerializableRepresentation {
  name: ConfigEntryName.SimpleMemoryKeyValueInternal;
  remoteProcess: { nodeId: string, processId: string } | undefined;
}

interface HashPartitionSerializableRepresentation {
  name: ConfigEntryName.HashPartition;
  partitionsCount: number;
  nestedConfig: SerializableRepresentation;
}

interface HashPartitionInternalSerializableRepresentation {
  name: ConfigEntryName.HashPartitionInternal;
  partitions: { [k: number]: HashPartitionDetails };
}

type SerializableRepresentation =
  | SimpleMemoryKeyValueSerializableRepresentation
  | SimpleMemoryKeyValueInternalSerializableRepresentation
  | HashPartitionSerializableRepresentation
  | HashPartitionInternalSerializableRepresentation;

export class ConfigEntryCodec implements Codec<ConfigEntry, string> {
  async serialize(value: ConfigEntry): Promise<string> {
    return JSON.stringify(this.toSerializableRepresentation(value));
  }

  async deserialize(serialized: string): Promise<ConfigEntry | undefined> {
    return this.fromSerializableRepresentation(JSON.parse(serialized));
  }

  private toSerializableRepresentation(value: ConfigEntry): SerializableRepresentation {
    switch (value.name) {
      case ConfigEntryName.SimpleMemoryKeyValue:
        return { name: value.name };
      case ConfigEntryName.SimpleMemoryKeyValueInternal:
        return { name: value.name, remoteProcess: value.remoteProcess };
      case ConfigEntryName.HashPartition:
        return {
          name: value.name,
          partitionsCount: value.partitionsCount,
          nestedConfig: this.toSerializableRepresentation(value.nestedConfig),
        };
      case ConfigEntryName.HashPartitionInternal:
        return { name: value.name, partitions: value.partitions };
      default:
        return assertNever(value);
    }
  }

  private fromSerializableRepresentation(value: SerializableRepresentation): ConfigEntry {
    switch (value.name) {
      case ConfigEntryName.SimpleMemoryKeyValue:
        return new SimpleMemoryKeyValueEntry();
      case ConfigEntryName.SimpleMemoryKeyValueInternal:
        return new SimpleMemoryKeyValueInternalEntry(value.remoteProcess);
      case ConfigEntryName.HashPartition:
        return new HashPartitionEntry(value.partitionsCount, this.fromSerializableRepresentation(value.nestedConfig));
      case ConfigEntryName.HashPartitionInternal:
        return new HashPartitionInternalEntry(value.partitions);
      default:
        return assertNever(value);
    }
  }
}
