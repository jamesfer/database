import { BaseProcessActionRequest, ProcessActionGroupName } from './scaffolding/base-process-action-request';

export enum KeyValueProcessAction {
  Get = 'Get',
  Put = 'Put',
  Drop = 'Drop',
}

interface RequestBase<A extends KeyValueProcessAction> extends BaseProcessActionRequest {
  group: ProcessActionGroupName.KeyValue;
  action: A;
}

export interface KeyValueProcessGetRequest extends RequestBase<KeyValueProcessAction.Get> {
  key: string;
}

export interface KeyValueProcessPutRequest extends RequestBase<KeyValueProcessAction.Put> {
  key: string;
  value: ArrayBuffer;
}

export interface KeyValueProcessDropRequest extends RequestBase<KeyValueProcessAction.Drop> {
  key: string;
}

export type KeyValueProcessRequest =
  | KeyValueProcessGetRequest
  | KeyValueProcessPutRequest
  | KeyValueProcessDropRequest;
