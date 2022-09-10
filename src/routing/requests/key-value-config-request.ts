import { BaseConfigActionRequest, ConfigActionGroupName } from './base-config-action-request';

export enum KeyValueConfigAction {
  Get = 'Get',
  Put = 'Put',
  Drop = 'Drop',
}

interface RequestBase<A extends KeyValueConfigAction> extends BaseConfigActionRequest {
  group: ConfigActionGroupName.KeyValue;
  action: A;
}

export interface KeyValueConfigGetRequest extends RequestBase<KeyValueConfigAction.Get> {
  key: string;
}

export interface KeyValueConfigPutRequest extends RequestBase<KeyValueConfigAction.Put> {
  key: string;
  value: ArrayBuffer;
}

export interface KeyValueConfigDropRequest extends RequestBase<KeyValueConfigAction.Drop> {
  key: string;
}

export type KeyValueConfigRequest =
  | KeyValueConfigGetRequest
  | KeyValueConfigPutRequest
  | KeyValueConfigDropRequest;
