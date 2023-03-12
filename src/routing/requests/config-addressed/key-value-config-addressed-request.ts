import { BaseConfigAddressedRequest, ConfigAddressedGroupName } from './base-config-addressed-request';

export enum KeyValueConfigAddressedRequestAction {
  Get = 'Get',
  Put = 'Put',
  Drop = 'Drop',
}

interface RequestBase<A extends KeyValueConfigAddressedRequestAction> extends BaseConfigAddressedRequest {
  group: ConfigAddressedGroupName.KeyValue;
  action: A;
}

export interface KeyValueConfigGetRequest extends RequestBase<KeyValueConfigAddressedRequestAction.Get> {
  key: string;
}

export interface KeyValueConfigPutRequest extends RequestBase<KeyValueConfigAddressedRequestAction.Put> {
  key: string;
  value: string;
}

export interface KeyValueConfigDropRequest extends RequestBase<KeyValueConfigAddressedRequestAction.Drop> {
  key: string;
}

export type KeyValueConfigAddressedRequest =
  | KeyValueConfigGetRequest
  | KeyValueConfigPutRequest
  | KeyValueConfigDropRequest;
