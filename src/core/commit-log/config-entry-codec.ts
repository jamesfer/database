import { ConfigEntry } from '../../config/config-entry';
import { Codec } from '../../types/codec';
import { AllComponentsLookup } from '../../components/scaffolding/all-components-lookup';
import { assert } from '../../utils/assert';
import { SERIALIZABLE_FACADE_FLAG } from '../../facades/serializable-facade';

// interface SimpleMemoryKeyValueSerializableRepresentation {
//   name: ConfigEntryName.SimpleMemoryKeyValue;
// }
//
// interface SimpleMemoryKeyValueInternalSerializableRepresentation {
//   name: ConfigEntryName.SimpleMemoryKeyValueInternal;
//   remoteProcess: { nodeId: string, processId: string } | undefined;
// }

// interface HashPartitionSerializableRepresentation {
//   name: ConfigEntryName.HashPartition;
//   partitionsCount: number;
//   nestedConfig: SerializableRepresentation;
// }
//
// interface HashPartitionInternalSerializableRepresentation {
//   name: ConfigEntryName.HashPartitionInternal;
//   partitions: { [k: number]: HashPartitionDetails };
// }

// type SerializableRepresentation =
//   | SimpleMemoryKeyValueSerializableRepresentation
//   | SimpleMemoryKeyValueInternalSerializableRepresentation
//   // | HashPartitionSerializableRepresentation
//   // | HashPartitionInternalSerializableRepresentation;

export class ConfigEntryCodec implements Codec<ConfigEntry, string> {
  async serialize(value: ConfigEntry): Promise<string> {
    const component = AllComponentsLookup[value.NAME];
    assert(
      SERIALIZABLE_FACADE_FLAG in component.FACADES,
      `Cannot serialize ${value.NAME} component as it does not have a serializer implementation`,
    );

    const serializer = component.FACADES[SERIALIZABLE_FACADE_FLAG];
    return serializer.serialize(value as any);
  }

  async deserialize(serialized: string): Promise<ConfigEntry | undefined> {
    // This is a kind of inefficient way to deserialize things, but for now, it's the best we have.
    for (const component of Object.values(AllComponentsLookup)) {
      if (SERIALIZABLE_FACADE_FLAG in component.FACADES) {
        const deserializedResult = component.FACADES[SERIALIZABLE_FACADE_FLAG].deserialize(serialized);
        if (deserializedResult) {
          return deserializedResult;
        }
      }
    }
  }

  // private toSerializableRepresentation(value: ConfigEntry): string {
  //
  //   switch (value.NAME) {
  //     case ConfigEntryName.SimpleMemoryKeyValue:
  //       return { name: value.name };
  //     case ConfigEntryName.SimpleMemoryKeyValueInternal:
  //       return { name: value.name, remoteProcess: value.remoteProcess };
  //     // case ConfigEntryName.HashPartition:
  //     //   return {
  //     //     name: value.name,
  //     //     partitionsCount: value.partitionsCount,
  //     //     nestedConfig: this.toSerializableRepresentation(value.nestedConfig),
  //     //   };
  //     // case ConfigEntryName.HashPartitionInternal:
  //     //   return { name: value.name, partitions: value.partitions };
  //     default:
  //       return assertNever(value);
  //   }
  // }

  // private fromSerializableRepresentation(value: SerializableRepresentation): ConfigEntry {
  //   switch (value.name) {
  //     case ConfigEntryName.SimpleMemoryKeyValue:
  //       return new SimpleInMemoryKeyValueConfiguration();
  //     case ConfigEntryName.SimpleMemoryKeyValueInternal:
  //       return new SimpleInMemoryKeyValueInternalConfiguration(value.remoteProcess);
  //     // case ConfigEntryName.HashPartition:
  //     //   return new HashPartitionEntry(value.partitionsCount, this.fromSerializableRepresentation(value.nestedConfig));
  //     // case ConfigEntryName.HashPartitionInternal:
  //     //   return new HashPartitionInternalEntry(value.partitions);
  //     default:
  //       return assertNever(value);
  //   }
  // }
}
