import { BaseRequest } from '../base-request';
import { RequestCategory } from '../../types/request-category';

export enum ProcessAddressedGroupName {
  KeyValue = 'KeyValue',
  ProcessControl = 'ProcessControl',
}

export interface BaseProcessAddressedRequest extends BaseRequest {
  category: RequestCategory.ProcessAction;
  group: ProcessAddressedGroupName;
  targetNodeId: string;
  targetProcessId: string;
}
