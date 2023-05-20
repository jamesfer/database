import { BaseConfigAddressedRequest, ConfigAddressedGroupName } from '../base-config-addressed-request';

export enum KeyValueConfigAddressedRequestActionType {
  Get = 'Get',
  Put = 'Put',
  Drop = 'Drop',
}

export interface BaseRequest<A extends KeyValueConfigAddressedRequestActionType>
  extends BaseConfigAddressedRequest<ConfigAddressedGroupName.KeyValue> {
  action: A;
}
