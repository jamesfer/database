import { EQUALS_FACADE_NAME } from '../../../facades/equals-facade';
import { SERIALIZABLE_FACADE_FLAG } from '../../../facades/serializable-facade';
import { AllFacades } from '../../../facades/scaffolding/all-facades';
import { TransformationRunnerInternalConfiguration } from './transformation-runner-internal-configuration';
import { transformationRunnerInternalEqualsFacade } from './facade-implementations/equals';
import { transformationRunnerInternalSerializableFacade } from './facade-implementations/serializable';

export type TransformationRunnerInternalFacadeNames =
  | EQUALS_FACADE_NAME
  | SERIALIZABLE_FACADE_FLAG;

export type TransformationRunnerInternalFacades = Pick<AllFacades<TransformationRunnerInternalConfiguration>, TransformationRunnerInternalFacadeNames>;

export const TransformationRunnerInternalFacades: TransformationRunnerInternalFacades = {
  [EQUALS_FACADE_NAME]: transformationRunnerInternalEqualsFacade,
  [SERIALIZABLE_FACADE_FLAG]: transformationRunnerInternalSerializableFacade,
}
