import { BaseRequest } from '../base-request';
import { RequestCategory } from '../../types/request-category';

export enum ProcessAddressedGroupName {
  KeyValue = 'KeyValue',
  TransformationRunner = 'TransformationRunner',
}

export interface BaseProcessAddressedRequest extends BaseRequest {
  category: RequestCategory.ProcessAction;
  group: ProcessAddressedGroupName;
  targetNodeId: string;
  targetProcessId: string;
}
