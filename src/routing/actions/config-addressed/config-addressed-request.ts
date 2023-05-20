import { KeyValueConfigAddressedAction } from './key-value/action';
import { TransformationRunnerConfigAddressedAction } from './transformation-runner/action';
import { ComponentStateConfigAddressedRequest } from './component-state/action';
import { RowBlockConfigAddressedRequest } from './row-block/row-block-config-addressed-request';

export type ConfigAddressedRequest =
  | KeyValueConfigAddressedAction
  | TransformationRunnerConfigAddressedAction
  | ComponentStateConfigAddressedRequest
  | RowBlockConfigAddressedRequest;
