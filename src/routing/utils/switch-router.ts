import { RequestRouter } from '../types/request-router';
import { Refine } from '../../types/refine';
import { Key, switchFunctionOnKey } from '../../utils/switch-function-on-key';
import { BaseRequest } from '../actions/base-request';

// TODO add better typing for requests and responses
// export type RequestRouterForPair<R extends RequestResponse<any, any>> = RequestRouter<R['request'], R['response']>;
//
// type RequestRouterForKey<
//   K extends Key,
//   R extends RequestResponse<{ [S in K]: Key }, any>,
//   V extends R['request'][K],
// > = RequestRouterForPair<Refine<R, RequestResponse<{ [k in K]: V }, any>>>;
//
// export const switchRouter = <K extends Key>(
//   key: K,
// ) => <R extends RequestResponse<{ [S in K]: Key }, any>>(
//   individualRouters: { [V in R['request'][K]]: RequestRouterForKey<K, R, V> },
// ): RequestRouterForPair<R> => switchFunctionOnKey<K>(key)<R['request'], Promise<R['response']>>(individualRouters);

export const switchRouter = <K extends Key>(
  key: K,
) => <R extends BaseRequest & { [S in K]: Key }, S>(
  individualRouters: { [V in R[K]]: RequestRouter<Refine<R, { [k in K]: V }>, S> },
): RequestRouter<R, S> => switchFunctionOnKey<K>(key)<R, Promise<S>>(individualRouters);
