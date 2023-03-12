import { Query } from '../../../components/transformation-runner/query-language/query';
import { BaseConfigAddressedRequest, ConfigAddressedGroupName } from './base-config-addressed-request';

export enum TransformationRunnerConfigRequestAction {
  RunQuery = 'RunQuery',
}

export interface TransformationRunnerConfigRunQueryRequest extends BaseConfigAddressedRequest {
  group: ConfigAddressedGroupName.TransformationRunner;
  action: TransformationRunnerConfigRequestAction.RunQuery;
  query: Query;
}

export type TransformationRunnerConfigAddressedRequest =
  | TransformationRunnerConfigRunQueryRequest;
