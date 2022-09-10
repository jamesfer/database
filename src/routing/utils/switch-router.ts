import { RequestRouter } from '../types/request-router';
import { Refine } from '../../types/refine';
import { Key, switchFunctionOnKey } from '../../utils/switch-function-on-key';
import { Response } from '../types/response';
import { BaseRequest } from '../requests/base-request';

export const switchRouter = <K extends Key>(
  key: K,
) => <R extends BaseRequest & { [S in K]: Key }>(
  individualRouters: { [V in R[K]]: RequestRouter<Refine<R, { [k in K]: V }>> },
): RequestRouter<R> => switchFunctionOnKey<K>(key)<R, Promise<Response>>(individualRouters);
