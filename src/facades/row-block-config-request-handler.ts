import { RpcInterface } from '../rpc/rpc-interface';
import { AnyRequestResponse } from '../routing/actions/any-request-response';
import { MetadataManager } from '../core/metadata-state/metadata-manager';
import { AllComponentConfigurations } from '../components/scaffolding/all-component-configurations';
import {
  RowBlockConfigAddressedRequest
} from '../routing/actions/config-addressed/row-block/row-block-config-addressed-request';
import { Response } from '../routing/types/response';
import {
  RowBlockConfigAddressedResponse
} from '../routing/actions/config-addressed/row-block/row-block-config-addressed-response';

export const ROW_BLOCK_CONFIG_REQUEST_HANDLER_FACADE = 'ROW_BLOCK_CONFIG_REQUEST_HANDLER_FACADE';

export type ROW_BLOCK_CONFIG_REQUEST_HANDLER_FACADE = typeof ROW_BLOCK_CONFIG_REQUEST_HANDLER_FACADE;

export interface RowBlockConfigRequestRouterContext {
  rpcInterface: RpcInterface<AnyRequestResponse>,
  metadataManager: MetadataManager,
}

export interface RowBlockConfigRequestHandlerFacade<C> {
  handleRowBlockConfigRequest(
    context: RowBlockConfigRequestRouterContext,
    request: RowBlockConfigAddressedRequest,
    config: C,
  ): Promise<RowBlockConfigAddressedResponse>,
}

declare module './scaffolding/all-facades' {
  export interface AllFacades<C extends AllComponentConfigurations> {
    [ROW_BLOCK_CONFIG_REQUEST_HANDLER_FACADE]: RowBlockConfigRequestHandlerFacade<C>,
  }
}
