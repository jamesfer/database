import { Query } from '../components/transformation-runner/query-language/query';
import { AllComponentConfigurations } from '../components/scaffolding/all-component-configurations';
import { RpcInterface } from '../rpc/rpc-interface';
import { MetadataManager } from '../core/metadata-state/metadata-manager';
import { TransformationRunnerProcessAddressedRequest } from '../routing/actions/process-addressed/transformation-runner-process-addressed-request';
import { Response } from '../routing/types/response';
import { AnyRequestResponse } from '../routing/actions/any-request-response';
import {
  TransformationRunnerConfigAddressedAction
} from '../routing/actions/config-addressed/transformation-runner/action';

export const TRANSFORMATION_RUNNER_CONFIG_REQUEST_HANDLER_FACADE = 'TRANSFORMATION_RUNNER_CONFIG_REQUEST_HANDLER_FACADE' as const;

export type TRANSFORMATION_RUNNER_CONFIG_REQUEST_HANDLER_FACADE = typeof TRANSFORMATION_RUNNER_CONFIG_REQUEST_HANDLER_FACADE;

export interface TransformationRunnerConfigRequestHandlerContext {
  rpcInterface: RpcInterface<AnyRequestResponse>,
  metadataManager: MetadataManager,
}

export interface TransformationRunnerConfigRequestHandler<C> {
  handleTransformationRunnerProcessRequest(
    context: TransformationRunnerConfigRequestHandlerContext,
    request: TransformationRunnerConfigAddressedAction, // TODO change to config request
    config: C,
  ): Promise<Response>;
}

declare module './scaffolding/all-facades' {
  export interface AllFacades<C extends AllComponentConfigurations> {
    [TRANSFORMATION_RUNNER_CONFIG_REQUEST_HANDLER_FACADE]: TransformationRunnerConfigRequestHandler<C>;
  }
}
