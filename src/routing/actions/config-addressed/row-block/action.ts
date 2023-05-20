import { ScanAllRowBlockConfigAddressedAction } from './scan-all';
import { AppendRowBlockConfigAddressedAction } from './append-row';

export type RowBlockConfigAddressedAction =
  | ScanAllRowBlockConfigAddressedAction
  | AppendRowBlockConfigAddressedAction;
