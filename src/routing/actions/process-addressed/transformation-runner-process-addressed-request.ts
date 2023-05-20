import {
  BaseProcessAddressedRequest,
  ProcessAddressedGroupName
} from './base-process-addressed-request';
import { Query } from '../../../components/transformation-runner/query-language/query';

export enum TransformationRunnerProcessRequestAction {
  RunQuery = 'RunQuery',
}

export interface TransformationRunnerProcessRunQueryRequest extends BaseProcessAddressedRequest {
  group: ProcessAddressedGroupName.TransformationRunner;
  action: TransformationRunnerProcessRequestAction.RunQuery;
  query: Query;
}

export type TransformationRunnerProcessAddressedRequest =
  | TransformationRunnerProcessRunQueryRequest;
