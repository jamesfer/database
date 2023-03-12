import { EQUALS_FACADE_NAME } from '../../../facades/equals-facade';
import { SERIALIZABLE_FACADE_FLAG } from '../../../facades/serializable-facade';
import { DISTRIBUTED_OPERATOR_FACADE_NAME } from '../../../facades/distributed-operator-facade';
import { AllFacades } from '../../../facades/scaffolding/all-facades';
import { TransformationRunnerConfiguration } from './transformation-runner-configuration';
import { TransformationRunnerDistributedOperatorFacade } from './facade-implementations/distributed-operator';
import { transformationRunnerEqualsFacade } from './facade-implementations/equals';
import { transformationRunnerSerializableFacade } from './facade-implementations/serializable';
import {
  TRANSFORMATION_RUNNER_CONFIG_REQUEST_HANDLER_FACADE
} from '../../../facades/transformation-runner-config-request-handler';
import {
  transformationRunnerConfigRequestHandler
} from './facade-implementations/transformation-runner-config-request-handler';

export type TransformationRunnerFacadeNames =
  | EQUALS_FACADE_NAME
  | SERIALIZABLE_FACADE_FLAG
  | DISTRIBUTED_OPERATOR_FACADE_NAME
  | TRANSFORMATION_RUNNER_CONFIG_REQUEST_HANDLER_FACADE

export type TransformationRunnerFacades = Pick<AllFacades<TransformationRunnerConfiguration>, TransformationRunnerFacadeNames>;

export const TransformationRunnerFacades: TransformationRunnerFacades = {
  [EQUALS_FACADE_NAME]: transformationRunnerEqualsFacade,
  [SERIALIZABLE_FACADE_FLAG]: transformationRunnerSerializableFacade,
  [DISTRIBUTED_OPERATOR_FACADE_NAME]: TransformationRunnerDistributedOperatorFacade,
  [TRANSFORMATION_RUNNER_CONFIG_REQUEST_HANDLER_FACADE]: transformationRunnerConfigRequestHandler,
};
