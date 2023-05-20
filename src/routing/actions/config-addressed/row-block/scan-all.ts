import { BaseConfigAddressedRequest, ConfigAddressedGroupName } from '../base-config-addressed-request';
import { RowBlockConfigAddressedRequestActionType } from './request-action-type';

export interface ScanAllRowBlockConfigAddressedRequest extends BaseConfigAddressedRequest<ConfigAddressedGroupName.RowBlock> {
  action: RowBlockConfigAddressedRequestActionType.ScanAll;
}

export interface ScanAllRowBlockConfigAddressedResponse {
  rows: any[],
}

export type ScanAllRowBlockConfigAddressedAction = Action<ScanAllRowBlockConfigAddressedRequest, ScanAllRowBlockConfigAddressedResponse>;
