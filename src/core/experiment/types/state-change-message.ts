import avsc from 'avsc';
import { Codec } from '../../../avro';
import { KeyedUpdate } from './keyed-update';

export interface StateChangeMessage<T> {
  readonly changes: KeyedUpdate<T>[];
}

interface StateChangeMessageSerialization<T> {
  readonly changes: {
    readonly id: string;
    readonly timestamp: number;
    readonly path: string;
    readonly state: Buffer | null;
  }[];
}

const stateChangeMessageSchema: avsc.schema.DefinedType = {
  type: 'record',
  name: 'StateChangeMessage',
  namespace: 'gossip.messages',
  fields: [
    {
      name: 'changes',
      type: {
        type: 'record',
        name: 'KeyedUpdate',
        namespace: 'gossip.messages',
        fields: [
          {
            name: 'path',
            type: 'string',
          },
          {
            name: 'id',
            type: 'string',
          },
          {
            name: 'timestamp',
            type: 'int',
          },
          {
            name: 'state',
            type: [
              'bytes',
              'null'
            ],
          },
        ],
      },
    },
  ],
};

export function makeStateChangeMessageCodec<T>(valueCodec: Codec<T>): Codec<StateChangeMessage<T>> {
  return Codec.create<StateChangeMessage<T>, StateChangeMessageSerialization<T>>(
    stateChangeMessageSchema,
    message => ({
      changes: message.changes.map(update => ({
        id: update.id,
        timestamp: update.timestamp,
        path: update.path,
        state: update.state === undefined ? null : valueCodec.serialize(update.state),
      })),
    }),
    encodedMessage => ({
      changes: encodedMessage.changes.map(encodedValue => ({
        id: encodedValue.id,
        timestamp: encodedValue.timestamp,
        path: encodedValue.path,
        state: encodedValue.state === null ? undefined : valueCodec.deserialize(encodedValue.state),
      })),
    }),
  );
}
