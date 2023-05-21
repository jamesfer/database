import { Query } from '../../../components/transformation-runner/query-language/query';
import { BaseConfigAddressedRequest, ConfigAddressedGroupName } from './base-config-addressed-request';
import { AnyComponentConfiguration } from '../../../components/any-component-configuration';
import { Response } from '../../types/response';

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

export class TransformationRunnerConfigAddressedRequestHandler {
  async handleTransformationRunnerConfigAddressedRequest(
    componentConfiguration: AnyComponentConfiguration,
    request: TransformationRunnerConfigAddressedRequest,
  ): Promise<Response> {

  }
}
