import { KeyValueProcessAddressedRequest } from './key-value-process-addressed-request';
import {
  TransformationRunnerProcessAddressedRequest,
} from './transformation-runner-process-addressed-request';
import { RowBlockProcessAddressedRequest } from './row-block-process-addressed-request';

export type ProcessAddressedRequest =
  | KeyValueProcessAddressedRequest
  | TransformationRunnerProcessAddressedRequest
  | RowBlockProcessAddressedRequest;
