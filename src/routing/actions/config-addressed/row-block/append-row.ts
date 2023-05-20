import { BaseConfigAddressedRequest, ConfigAddressedGroupName } from '../base-config-addressed-request';
import { RowBlockConfigAddressedRequestActionType } from './request-action-type';

export interface AppendRowBlockConfigAddressedRequest extends BaseConfigAddressedRequest<ConfigAddressedGroupName.RowBlock> {
  action: RowBlockConfigAddressedRequestActionType.Append;
  rows: any[],
}

export type AppendRowBlockConfigAddressedAction = Action<AppendRowBlockConfigAddressedRequest, undefined>;
