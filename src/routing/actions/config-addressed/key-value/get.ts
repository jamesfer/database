import { BaseRequest, KeyValueConfigAddressedRequestActionType } from './base-request';
import { RequestResponse } from '../../request-response';

export interface KeyValueConfigGetRequest extends BaseRequest<KeyValueConfigAddressedRequestActionType.Get> {
  key: string;
}

export type KeyValueConfigGetAction = RequestResponse<KeyValueConfigGetRequest, string>;
