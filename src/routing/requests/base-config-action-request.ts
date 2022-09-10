import { RequestCategory } from '../types/request-category';
import { BaseRequest } from './base-request';
import { FullyQualifiedPath } from '../../config/config';

export enum ConfigActionGroupName {
  KeyValue = 'KeyValue',
  Stream = 'Stream',
}

export interface BaseConfigActionRequest extends BaseRequest {
  category: RequestCategory.ConfigAction;
  target: FullyQualifiedPath;
  group: ConfigActionGroupName;
}
