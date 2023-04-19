import { KeyValueConfigAddressedRequest } from './key-value-config-addressed-request';
import { TransformationRunnerConfigAddressedRequest } from './transformation-runner-config-addressed-request';
import { ComponentStateConfigAddressedRequest } from './component-state-config-addressed-request';
import { RowBlockConfigAddressedRequest } from './row-block-config-addressed-request';

export type ConfigAddressedRequest =
  | KeyValueConfigAddressedRequest
  | TransformationRunnerConfigAddressedRequest
  | ComponentStateConfigAddressedRequest
  | RowBlockConfigAddressedRequest;
