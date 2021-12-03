import avsc, { schema } from 'avsc';
import { Codec, UnionCodec } from '../../../avro';
import { ConfigEntry, FullyQualifiedPath } from '../../../types/config';

interface StateChangeBase {
  readonly timestamp: number;
  readonly id: FullyQualifiedPath;
  readonly hash: string;
}

export class StateDelete implements StateChangeBase {
  static readonly codec = new Codec<StateDelete>(
    {
      name: 'StateDelete',
      type: 'record',
      fields: [
        {
          name: 'id',
          type: {
            type: 'array',
            items: 'string',
          },
        },
        {
          name: 'timestamp',
          type: { type: 'int' },
        },
        {
          name: 'hash',
          type: { type: 'string' },
        },
      ],
    },
    decoded => new StateDelete(decoded.id, decoded.timestamp, decoded.hash),
  );

  constructor(
    readonly id: FullyQualifiedPath,
    readonly timestamp: number,
    readonly hash: string,
  ) { }
}

export class StatePut implements StateChangeBase {
  static readonly codec = new Codec<StatePut>(
    {
      name: 'StateDelete',
      type: 'record',
      fields: [
        {
          name: 'timestamp',
          type: { type: 'int' },
        },
        {
          name: 'configEntry',
          type: StatePut.avroType, // TODO
        },
        {
          name: 'hash',
          type: { type: 'string' },
        },
      ],
    },
    decoded => new StatePut(decoded.timestamp, decoded.configEntry, decoded.hash),
  );

  constructor(
    readonly timestamp: number,
    readonly configEntry: ConfigEntry,
    readonly hash: string,
  ) {}

  get id() {
    return this.configEntry.id;
  }
}

export type StateChange = StateDelete | StatePut;

export const stateChangeCodec = new Codec<StateChange>(
  [StateDelete.codec.avroSchema, StateDelete.codec.avroSchema].flat(),
  value => 'StateDelete' in value ? value.StateDelete : value.StatePut,
  value => value instanceof StateDelete
    ? { StateDelete: value }
    : { StatePut: value },
)

const x = new UnionCodec<StateChange>([StatePut, StateDelete])

export const stateChangeAvroSchema: avsc.schema.DefinedType[] = [StateDelete.avroSchema, StatePut.avroSchema];
export const stateChangeAvroType = avsc.Type.forSchema(stateChangeAvroSchema);

