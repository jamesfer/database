import { Response } from '../routing/types/response';
import { RpcInterface } from '../rpc/rpc-interface';
import { AnyRequest } from '../routing/requests/any-request';
import { MetadataManager } from '../core/metadata-state/metadata-manager';
import {
  ComponentStateConfigAddressedRequest
} from '../routing/requests/config-addressed/component-state-config-addressed-request';
import { AllComponentConfigurations } from '../components/scaffolding/all-component-configurations';

export const COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE = 'COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE';

export type COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE = typeof COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE;

export enum ComponentState {
  INITIALIZING,
  ERROR,
  READY,
}

export class ComponentInitializingState {
  public readonly state = ComponentState.INITIALIZING;

  constructor(
    public readonly message: string,
  ) {}

  toString(): string {
    return `${this.state}: ${this.message}`;
  }
}

export class ComponentErrorState {
  public readonly state = ComponentState.ERROR;

  constructor(
    public readonly message: string,
  ) {}

  toString(): string {
    return `${this.state}: ${this.message}`;
  }
}

export class ComponentReadyState {
  public readonly state = ComponentState.READY;

  toString(): string {
    return `${this.state}`;
  }
}

export type ComponentStateResponse =
  | ComponentInitializingState
  | ComponentErrorState
  | ComponentReadyState;

export interface ComponentStateConfigRequestRouterContext {
  rpcInterface: RpcInterface<AnyRequest>,
  metadataManager: MetadataManager,
}

export interface ComponentStateConfigRequestHandlerFacade<C> {
  handleComponentStateConfigRequest(
    context: ComponentStateConfigRequestRouterContext,
    request: ComponentStateConfigAddressedRequest,
    config: C,
  ): Promise<ComponentStateResponse>,
}

declare module './scaffolding/all-facades' {
  export interface AllFacades<C extends AllComponentConfigurations> {
    [COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE]: ComponentStateConfigRequestHandlerFacade<C>,
  }
}
