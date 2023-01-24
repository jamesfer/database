import { RpcInterface } from '../rpc/rpc-interface';
import { AnyRequest } from '../routing/unified-request-router';
import { KeyValueConfigAddressedRequest } from '../routing/requests/key-value-config-addressed-request';
import { MetadataManager } from '../core/metadata-state/metadata-manager';
import { Response } from '../routing/types/response';
import { AllComponentConfigurations } from '../components/scaffolding/all-component-configurations';

export const KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME = 'KEY_VALUE_CONFIG_REQUEST_ROUTER' as const;

export type KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME = typeof KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME;

export interface KeyValueConfigRequestRouterContext {
  rpcInterface: RpcInterface<AnyRequest>,
  metadataManager: MetadataManager,
}

export type KeyValueConfigRequestHandler<C> = (
  context: KeyValueConfigRequestRouterContext,
  request: KeyValueConfigAddressedRequest,
  config: C,
) => Promise<Response>

export interface KeyValueConfigRequestRouterFacade<C> {
  handleKeyValueConfigRequest: KeyValueConfigRequestHandler<C>
}

declare module './scaffolding/all-facades' {
  export interface AllFacades<C extends AllComponentConfigurations> {
    [KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME]: KeyValueConfigRequestRouterFacade<C>;
  }
}
