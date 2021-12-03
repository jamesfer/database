import avsc from 'avsc';
import { Codec } from '../../avro';

export interface KeyedUpdate<T> {
  readonly id: string;
  readonly state: T | undefined;
}

export function updateCodec<T>(valueCodec: Codec<T>): Codec<KeyedUpdate<T>> {
  return Codec.create<KeyedUpdate<T>, { id: string, state: Buffer | null }>(
    {
      type: 'record',
      name: 'KeyedUpdate',
      namespace: 'gossip.messages',
      fields: [
        {
          name: 'id',
          type: 'string',
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
    update => ({
      id: update.id,
      state: update.state === undefined ? null : valueCodec.serialize(update.state),
    }),
    encodedValue => ({
      id: encodedValue.id,
      state: encodedValue.state === null ? undefined : valueCodec.deserialize(encodedValue.state),
    }),
  );
}

export function updateArrayCodec<T>(valueCodec: Codec<T>): Codec<KeyedUpdate<T>[]> {
  return Codec.create<KeyedUpdate<T>[], { id: string, state: Buffer | null }[]>(
    {
      type: 'record',
      name: 'KeyedUpdate',
      namespace: 'gossip.messages',
      fields: [
        {
          name: 'id',
          type: 'string',
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
    updates => updates.map(update => ({
      id: update.id,
      state: update.state === undefined ? null : valueCodec.serialize(update.state),
    })),
    encodedValues => encodedValues.map(encodedValue => ({
      id: encodedValue.id,
      state: encodedValue.state === null ? undefined : valueCodec.deserialize(encodedValue.state),
    })),
  );
}
