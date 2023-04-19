import { EQUALS_FACADE_NAME } from '../../../facades/equals-facade';
import { SERIALIZABLE_FACADE_FLAG } from '../../../facades/serializable-facade';
import { DISTRIBUTED_OPERATOR_FACADE_NAME } from '../../../facades/distributed-operator-facade';
import { COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE } from '../../../facades/component-state-config-request-handler';
import { JsonLinesRowBlockConfiguration } from './json-lines-row-block-configuration';
import { AllFacades } from '../../../facades/scaffolding/all-facades';
import { jsonLinesRowBlockEqualsFacade } from './facade-implementations/equals';
import { jsonLinesRowBlockSerializableFacade } from './facade-implementations/serializable';
import { ROW_BLOCK_CONFIG_REQUEST_HANDLER_FACADE } from '../../../facades/row-block-config-request-handler';
import { jsonLinesRowBlockConfigRequestHandler } from './facade-implementations/row-block-config-request-handler';
import { JsonLinesDistributedOperatorFacade } from './facade-implementations/distributed-operator';
import {
  jsonLinesRowBlockComponentStateRouterFacade
} from './facade-implementations/component-state-config-request-handler';

export type JsonLinesRowBlockFacadeNames =
  | EQUALS_FACADE_NAME
  | SERIALIZABLE_FACADE_FLAG
  | DISTRIBUTED_OPERATOR_FACADE_NAME
  | ROW_BLOCK_CONFIG_REQUEST_HANDLER_FACADE
  | COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE;

export type JsonLinesRowBlockFacades = Pick<AllFacades<JsonLinesRowBlockConfiguration>, JsonLinesRowBlockFacadeNames>;

export const JsonLinesRowBlockFacades: JsonLinesRowBlockFacades = {
  [EQUALS_FACADE_NAME]: jsonLinesRowBlockEqualsFacade,
  [SERIALIZABLE_FACADE_FLAG]: jsonLinesRowBlockSerializableFacade,
  [DISTRIBUTED_OPERATOR_FACADE_NAME]: JsonLinesDistributedOperatorFacade,
  [ROW_BLOCK_CONFIG_REQUEST_HANDLER_FACADE]: jsonLinesRowBlockConfigRequestHandler,
  [COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE]: jsonLinesRowBlockComponentStateRouterFacade,
}
