import { EQUALS_FACADE_NAME } from '../../../facades/equals-facade';
import { SERIALIZABLE_FACADE_FLAG } from '../../../facades/serializable-facade';
import { DISTRIBUTED_OPERATOR_FACADE_NAME } from '../../../facades/distributed-operator-facade';
import { COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE } from '../../../facades/component-state-config-request-handler';
import { JsonLinesRowBlockInternalConfiguration } from './json-lines-row-block-internal-configuration';
import { AllFacades } from '../../../facades/scaffolding/all-facades';
import { jsonLinesRowBlockInternalEqualsFacade } from './facade-implementations/equals';
import { jsonLinesRowBlockInternalSerializableFacade } from './facade-implementations/serializable';

export type JsonLinesRowBlockInternalFacadeNames =
  | EQUALS_FACADE_NAME
  | SERIALIZABLE_FACADE_FLAG;

export type JsonLinesRowBlockInternalFacades = Pick<AllFacades<JsonLinesRowBlockInternalConfiguration>, JsonLinesRowBlockInternalFacadeNames>;

export const JsonLinesRowBlockInternalFacades: JsonLinesRowBlockInternalFacades = {
  [EQUALS_FACADE_NAME]: jsonLinesRowBlockInternalEqualsFacade,
  [SERIALIZABLE_FACADE_FLAG]: jsonLinesRowBlockInternalSerializableFacade,
}
