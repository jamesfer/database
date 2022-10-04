import { BaseProcessAddressedRequest, ProcessAddressedGroupName } from './process-addressed/base-process-addressed-request';

export enum KeyValueProcessAction {
  Get = 'Get',
  Put = 'Put',
  Drop = 'Drop',
}

interface RequestBase<A extends KeyValueProcessAction> extends BaseProcessAddressedRequest {
  group: ProcessAddressedGroupName.KeyValue;
  action: A;
}

export interface KeyValueProcessGetRequest extends RequestBase<KeyValueProcessAction.Get> {
  key: string;
}

export interface KeyValueProcessPutRequest extends RequestBase<KeyValueProcessAction.Put> {
  key: string;
  value: string;
}

export interface KeyValueProcessDropRequest extends RequestBase<KeyValueProcessAction.Drop> {
  key: string;
}

export type KeyValueProcessRequest =
  | KeyValueProcessGetRequest
  | KeyValueProcessPutRequest
  | KeyValueProcessDropRequest;
