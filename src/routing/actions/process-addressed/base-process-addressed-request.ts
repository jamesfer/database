import { BaseRequest } from '../base-request';
import { RequestCategory } from '../request-category';

export enum ProcessAddressedGroupName {
  KeyValue = 'KeyValue',
  TransformationRunner = 'TransformationRunner',
  RowBlock = 'RowBlock',
}

export interface BaseProcessAddressedRequest extends BaseRequest {
  category: RequestCategory.Process;
  group: ProcessAddressedGroupName;
  targetNodeId: string;
  targetProcessId: string;
}
