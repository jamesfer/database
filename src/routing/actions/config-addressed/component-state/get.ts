import { BaseConfigAddressedRequest, ConfigAddressedGroupName } from '../base-config-addressed-request';
import { ComponentStateConfigAddressedRequestActionType } from './request-action-type';
import { Serializable } from '../../../../interfaces/serializable';
import { RequestCategory } from '../../request-category';
import { FullyQualifiedPath } from '../../../../core/metadata-state/config';

export class GetComponentStateConfigAddressedRequest implements
  BaseConfigAddressedRequest<ConfigAddressedGroupName.ComponentState>,
  Serializable
{
  public readonly category = RequestCategory.Config;
  public readonly group = ConfigAddressedGroupName.ComponentState;
  public readonly action = ComponentStateConfigAddressedRequestActionType.GetState;

  constructor(
    public readonly target: FullyQualifiedPath
  ) {}

  serialize(): string {
    return '';
  }
}

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

export type GetComponentStateConfigAddressedResponse =
  | ComponentInitializingState
  | ComponentErrorState
  | ComponentReadyState;

export type GetComponentStateConfigAddressedAction = Action<
  GetComponentStateConfigAddressedRequest,
  GetComponentStateConfigAddressedResponse
>;
