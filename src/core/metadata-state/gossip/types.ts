import avsc from 'avsc';
import { isArray } from 'lodash';
import { Codec } from '../../../avro';
import { StateChange, stateChangeAvroSchema } from '../types/state-change';

export class GossipStateResponse {
  static readonly codec = new Codec<GossipStateResponse>(
    {
      type: 'record',
      name: 'GossipStateResponse',
      fields: [
        {
          name: 'missingUpdates',
          type: {
            type: 'array',
            items: stateChangeAvroSchema,
          },
        },
      ],
    },
    decoded => new GossipStateResponse(decoded.missingUpdates) // TODO,
  );

  constructor(readonly missingUpdates: StateChange[]) {}
}


export class GossipStateRequest {
  static readonly codec = new Codec<GossipStateRequest>(
    {
      type: 'record',
      name: 'GossipStateRequest',
      fields: [
        {
          name: 'bloomFilter',
          type: 'bytes',
        },
      ],
    },
    decoded => new GossipStateRequest(decoded.bloomFilter),
  );

  constructor(readonly bloomFilter: Int32Array) {}
}
