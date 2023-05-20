import { ComponentStateConfigAddressedAction } from './component-state/action';
import { KeyValueConfigAddressedAction } from './key-value/action';
import { RowBlockConfigAddressedAction } from './row-block/action';
import { TransformationRunnerConfigAddressedAction } from './transformation-runner/action';

export type ConfigAddressedAction =
  | ComponentStateConfigAddressedAction
  | KeyValueConfigAddressedAction
  | RowBlockConfigAddressedAction
  | TransformationRunnerConfigAddressedAction;

export type ConfigAddressedActions = [
  ComponentStateConfigAddressedAction,
  KeyValueConfigAddressedAction,
  RowBlockConfigAddressedAction,
  TransformationRunnerConfigAddressedAction,
]
