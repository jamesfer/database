import { KeyValueConfigGetAction } from './get';
import { KeyValueConfigPutAction } from './put';
import { KeyValueConfigDropAction } from './drop';

export type KeyValueConfigAddressedAction =
  | KeyValueConfigGetAction
  | KeyValueConfigPutAction
  | KeyValueConfigDropAction;
