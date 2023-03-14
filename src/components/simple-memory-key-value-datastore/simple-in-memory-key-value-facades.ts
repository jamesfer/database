import { DISTRIBUTED_OPERATOR_FACADE_NAME } from '../../facades/distributed-operator-facade';
import { SimpleInMemoryKeyValueConfiguration } from './simple-in-memory-key-value-configuration';
import { EQUALS_FACADE_NAME } from '../../facades/equals-facade';
import { AllFacades } from '../../facades/scaffolding/all-facades';
import { simpleInMemoryKeyValueEqualsFacade } from './simple-in-memory-key-value-equals-facade';
import { simpleInMemoryKeyValueDistributedOperatorFacade } from './simple-in-memory-key-value-distributed-operator-facade';
import { KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME } from '../../facades/key-value-config-request-handler';
import { SERIALIZABLE_FACADE_FLAG } from '../../facades/serializable-facade';
import { ComponentName } from '../scaffolding/component-name';
import { simpleMemoryKeyValueRouterFacade } from './simple-in-memory-key-value-router-facade';
import { COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE } from '../../facades/component-state-config-request-handler';
import {
  simpleInMemoryKeyValueComponentStateRouterFacade
} from './simple-in-memory-key-value-component-state-router-facade';

export type SimpleInMemoryKeyValueFacadeNames =
  | EQUALS_FACADE_NAME
  | DISTRIBUTED_OPERATOR_FACADE_NAME
  | KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME
  | COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE
  | SERIALIZABLE_FACADE_FLAG;

export type SimpleInMemoryKeyValueFacades = Pick<AllFacades<SimpleInMemoryKeyValueConfiguration>, SimpleInMemoryKeyValueFacadeNames>

export const SimpleInMemoryKeyValueFacades: SimpleInMemoryKeyValueFacades = {
  [SERIALIZABLE_FACADE_FLAG]: {
    serialize(object: SimpleInMemoryKeyValueConfiguration): string {
      return JSON.stringify({ name: ComponentName.SimpleMemoryKeyValue });
    },
    deserialize(string: string): SimpleInMemoryKeyValueConfiguration | undefined {
      const json = JSON.parse(string);
      if (json.name === ComponentName.SimpleMemoryKeyValue) {
        return new SimpleInMemoryKeyValueConfiguration();
      }
    }
  },

  [KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME]: simpleMemoryKeyValueRouterFacade,
  [COMPONENT_STATE_CONFIG_REQUEST_HANDLER_FACADE]: simpleInMemoryKeyValueComponentStateRouterFacade,
  [DISTRIBUTED_OPERATOR_FACADE_NAME]: simpleInMemoryKeyValueDistributedOperatorFacade,
  [EQUALS_FACADE_NAME]: simpleInMemoryKeyValueEqualsFacade,
};
