import { BaseRequest, KeyValueConfigAddressedRequestActionType } from './base-request';

export interface KeyValueConfigPutRequest extends BaseRequest<KeyValueConfigAddressedRequestActionType.Put> {
  key: string;
  value: string;
}

export type KeyValueConfigPutAction = Action<KeyValueConfigPutRequest, undefined>;
