import { RequestRouter } from './request-router';
import { Request } from './request';
import { Refine } from '../../../types/refine';
import { Key, switchFunctionOnKey } from '../../../utils/switch-function-on-key';
import { Response } from './response';

// export const switchRouter = <K extends string | number | symbol>(
//   key: K,
// ) => <R extends Request & { [k in K]: string | number | symbol }>(
//   individualRouters: { [V in R[K]]: RequestRouter<Refine<R, { [k in K]: V }>> },
// ): RequestRouter<R> => {
//   return async (request) => {
//     const router = individualRouters[request[key]];
//     if (!router) {
//       throw new Error(`Could not correctly route request in switch router. Type key: ${key}, request type: ${request[key]}, accepted request types: ${Object.keys(individualRouters).join(', ')}`);
//     }
//
//     return router(request as any);
//   }
// };

export const switchRouter = <K extends Key>(
  key: K,
) => <R extends Request & { [S in K]: Key }>(
  individualRouters: { [V in R[K]]: RequestRouter<Refine<R, { [k in K]: V }>> },
): RequestRouter<R> => switchFunctionOnKey<K>(key)<R, Promise<Response>>(individualRouters);



// interface A extends PathRequest {
//   l: 'A';
// }
//
// interface B extends PathRequest {
//   l: 'B'
// }
//
// type AorB = A | B;
//
// switchRouter('l')<AorB>({
//   'A': async (r: A) => console.log(r.l),
//   'B': async (r: B) => console.log('B'),
// });
