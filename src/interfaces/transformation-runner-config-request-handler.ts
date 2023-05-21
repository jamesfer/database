import {
  TransformationRunnerConfigAddressedRequest
} from '../routing/requests/config-addressed/transformation-runner-config-addressed-request';
import { Response } from '../routing/types/response';

export interface TransformationRunnerConfigRequestHandler<T> {
  handleTransformationRunnerConfigRequest(
    config: T,
    request: TransformationRunnerConfigAddressedRequest,
  ): Promise<Response>;
}
