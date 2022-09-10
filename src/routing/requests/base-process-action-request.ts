import { BaseRequest } from './base-request';
import { RequestCategory } from '../types/request-category';

export enum ProcessActionGroupName {
  KeyValue = 'KeyValue',
  ProcessControl = 'ProcessControl',
}

export interface BaseProcessActionRequest extends BaseRequest {
  category: RequestCategory.ProcessAction;
  group: ProcessActionGroupName;
  targetNodeId: string;
  targetProcessId: string;
}
