import { RequestCategory } from '../../types/request-category';
import { BaseRequest } from '../base-request';
import { FullyQualifiedPath } from '../../../core/metadata-state/config';

export enum ConfigAddressedGroupName {
  KeyValue = 'KeyValue',
  Stream = 'Stream',
}

export interface BaseConfigAddressedRequest extends BaseRequest {
  category: RequestCategory.ConfigAction;
  target: FullyQualifiedPath;
  group: ConfigAddressedGroupName;
}
