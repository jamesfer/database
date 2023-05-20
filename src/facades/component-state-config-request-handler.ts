import { RpcInterface } from '../rpc/rpc-interface';
import { AnyRequestResponse } from '../routing/actions/any-request-response';
import { MetadataManager } from '../core/metadata-state/metadata-manager';
import {
  ComponentStateConfigAddressedRequest
} from '../routing/actions/config-addressed/component-state/action';
import { AllComponentConfigurations } from '../components/scaffolding/all-component-configurations';

export const COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE = 'COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE';

export type COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE = typeof COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE;

export enum ComponentState {
  INITIALIZING = 'INITIALIZING',
  ERROR = 'ERROR',
  READY = 'READY',
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
  rpcInterface: RpcInterface<AnyRequestResponse>,
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
