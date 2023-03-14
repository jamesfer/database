import { BaseConfigAddressedRequest, ConfigAddressedGroupName } from './base-config-addressed-request';

export enum ComponentStateConfigAddressedRequestAction {
  GetState = 'GetState',
}

export interface GetComponentStateConfigAddressedRequest extends BaseConfigAddressedRequest {
  group: ConfigAddressedGroupName.ComponentState;
  action: ComponentStateConfigAddressedRequestAction.GetState;
}

export type ComponentStateConfigAddressedRequest =
  | GetComponentStateConfigAddressedRequest;
