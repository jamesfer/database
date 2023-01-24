import { DISTRIBUTED_OPERATOR_FACADE_NAME, DistributedOperatorFacade } from '../distributed-operator-facade';
import { SERIALIZABLE_FACADE_FLAG, SerializableFacade } from '../serializable-facade';
import { Refine } from '../../types/refine';
import {
  KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME,
  KeyValueConfigRequestRouterFacade
} from '../key-value-config-request-handler';
import { ConfigEntryName } from '../../config/config-entry-name';
import {
  SimpleInMemoryKeyValueFacades
} from '../../components/simple-memory-key-value-datastore/simple-in-memory-key-value-facades';
import {
  SimpleInMemoryKeyValueInternalFacades
} from '../../components/simple-memory-key-value-datastore/simple-in-memory-key-value-internal-facades';
import { EqualsFacade } from '../equals-facade';

export type AnyFacade =
  | DistributedOperatorFacade<any>
  | SerializableFacade<any>
  | KeyValueConfigRequestRouterFacade<any>
  | EqualsFacade<any>;

export type AnyFacadeFlag =
  | DISTRIBUTED_OPERATOR_FACADE_NAME
  | SERIALIZABLE_FACADE_FLAG
  | KEY_VALUE_CONFIG_REQUEST_ROUTER_FACADE_NAME;

export type SelectFacades<F extends AnyFacadeFlag> = Refine<AnyFacade, { [K in F]: true }>

// export type AnyFacadeFlag = keyof AnyFacade;

// export interface FacadeMap {
//   [DISTRIBUTED_OPERATOR_FACADE_FLAG]: DistributedOperatorFacade<any, any>;
// }

function assertExtends<E>() {
  return function <T extends E>(value: T): T {
    return value;
  }
}

type FacadeLookupBaseType = { [K in ConfigEntryName]: AnyFacade | undefined };

export const FACADE_LOOKUP = assertExtends<FacadeLookupBaseType>()({
  [ConfigEntryName.SimpleMemoryKeyValue]: SimpleInMemoryKeyValueFacades,
  [ConfigEntryName.SimpleMemoryKeyValueInternal]: SimpleInMemoryKeyValueInternalFacades,
});

// This is a hacky way to check the type of the FACADE_LOOKUP variable. In the Typescript 4.9 this won't be needed
// due to the new satisfies operator
const _facadeTypeCheck: FacadeLookupBaseType = FACADE_LOOKUP;
