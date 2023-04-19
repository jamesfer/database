import { BaseConfigAddressedRequest, ConfigAddressedGroupName } from './base-config-addressed-request';
import { AppendRowBlockConfigAddressedResponse } from './row-block-config-addressed-response';

export enum RowBlockConfigAddressedRequestAction {
  ScanAll = 'ScanAll',
  Append = 'Append',
}

export interface ScanAllRowBlockConfigAddressedRequest extends BaseConfigAddressedRequest {
  group: ConfigAddressedGroupName.RowBlock;
  action: RowBlockConfigAddressedRequestAction.ScanAll;
}

export interface AppendRowBlockConfigAddressedRequest extends BaseConfigAddressedRequest {
  group: ConfigAddressedGroupName.RowBlock;
  action: RowBlockConfigAddressedRequestAction.Append;
  rows: any[],
}

export type RowBlockConfigAddressedRequest =
  | ScanAllRowBlockConfigAddressedRequest
  | AppendRowBlockConfigAddressedRequest;

export type RowBlockConfigAddressedApi =
  | RequestResponse<AppendRowBlockConfigAddressedRequest, AppendRowBlockConfigAddressedResponse>;
