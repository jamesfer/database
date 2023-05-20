import { BaseConfigAddressedRequest, ConfigAddressedGroupName } from '../base-config-addressed-request';
import { Query } from '../../../../components/transformation-runner/query-language/query';
import { TransformationRunnerConfigRequestActionType } from './request-action-type';

export interface TransformationRunnerConfigRunQueryRequest
  extends BaseConfigAddressedRequest<ConfigAddressedGroupName.TransformationRunner> {
  action: TransformationRunnerConfigRequestActionType.RunQuery;
  query: Query;
}

export type TransformationRunnerConfigAddressedRunQueryAction = Action<TransformationRunnerConfigRunQueryRequest, string>;
