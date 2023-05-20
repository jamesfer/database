import { BaseProcessAddressedRequest, ProcessAddressedGroupName } from './base-process-addressed-request';

export enum RowBlockProcessAddressedRequestAction {
  ScanAll = 'ScanAll',
  Append = 'Append',
}

export interface ScanAllRowBlockProcessAddressedRequest extends BaseProcessAddressedRequest {
  group: ProcessAddressedGroupName.RowBlock;
  action: RowBlockProcessAddressedRequestAction.ScanAll;
}

export interface AppendRowBlockProcessAddressedRequest extends BaseProcessAddressedRequest {
  group: ProcessAddressedGroupName.RowBlock;
  action: RowBlockProcessAddressedRequestAction.Append;
  rows: any[],
}

export type RowBlockProcessAddressedRequest =
  | ScanAllRowBlockProcessAddressedRequest
  | AppendRowBlockProcessAddressedRequest;
