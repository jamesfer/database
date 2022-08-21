import { WithFacadeFlag } from './scaffolding/base-facade';

// export const KEY_VALUE_CONTROLLER_FLAG: unique symbol = Symbol('KEY_VALUE_CONTROLLER_FLAG');
//
// export type KEY_VALUE_CONTROLLER_FLAG = typeof KEY_VALUE_CONTROLLER_FLAG;
//
// declare module './scaffolding/facade-dictionary' {
//   interface FacadeDictionary {
//     readonly [KEY_VALUE_CONTROLLER_FLAG]: KeyValueController
//   }
// }
//
// export interface KeyValueController {
//   put(key: string, value: ArrayBuffer): Promise<void>;
//   get(key: string): Promise<ArrayBuffer>;
//   drop(key: string): Promise<void>;
// }
