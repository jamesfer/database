import { KeyValueProcessRequest } from '../routing/requests/key-value-node-request';
import { RequestRouter } from '../routing/types/request-router';

export const KEY_VALUE_PROCESS_ROUTER_FLAG: unique symbol = Symbol('KEY_VALUE_PROCESS_ROUTER_FLAG');

export type KEY_VALUE_PROCESS_ROUTER_FLAG = typeof KEY_VALUE_PROCESS_ROUTER_FLAG;

export type KeyValueProcessRouter = RequestRouter<KeyValueProcessRequest>;

declare module './scaffolding/facade-dictionary' {
  interface FacadeDictionary {
    readonly [KEY_VALUE_PROCESS_ROUTER_FLAG]: KeyValueProcessRouter,
  }
}
