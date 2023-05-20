import { RpcInterface } from '../rpc/rpc-interface';
import { KeyValueConfigAddressedAction } from '../routing/actions/config-addressed/key-value/action';
import { MetadataManager } from '../core/metadata-state/metadata-manager';
import { Response } from '../routing/types/response';
import { AllComponentConfigurations } from '../components/scaffolding/all-component-configurations';
import { AnyRequestResponse } from '../routing/actions/any-request-response';

export const KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME = 'KEY_VALUE_CONFIG_REQUEST_ROUTER' as const;

export type KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME = typeof KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME;

export interface KeyValueConfigRequestRouterContext {
  rpcInterface: RpcInterface<AnyRequestResponse>,
  metadataManager: MetadataManager,
}

export type KeyValueConfigRequestHandler<C> = (
  context: KeyValueConfigRequestRouterContext,
  request: KeyValueConfigAddressedAction,
  config: C,
) => Promise<Response>

export interface KeyValueConfigRequestRouterFacade<C> {
  handleKeyValueConfigRequest: KeyValueConfigRequestHandler<C>;
}

declare module './scaffolding/all-facades' {
  export interface AllFacades<C extends AllComponentConfigurations> {
    [KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME]: KeyValueConfigRequestRouterFacade<C>;
  }
}
