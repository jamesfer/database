import { BaseRequest, KeyValueConfigAddressedRequestActionType } from './base-request';

export interface KeyValueConfigDropRequest extends BaseRequest<KeyValueConfigAddressedRequestActionType.Drop> {
  key: string;
}

export type KeyValueConfigDropAction = Action<KeyValueConfigDropRequest, undefined>;
