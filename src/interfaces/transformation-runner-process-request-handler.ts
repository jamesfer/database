import { Response } from '../routing/types/response';
import {
  TransformationRunnerProcessAddressedRequest
} from '../routing/requests/process-addressed/transformation-runner-process-addressed-request';

export interface TransformationRunnerProcessRequestHandler<T> {
  handleTransformationRunnerProcessRequest(
    process: T,
    request: TransformationRunnerProcessAddressedRequest,
  ): Promise<Response>;
}
