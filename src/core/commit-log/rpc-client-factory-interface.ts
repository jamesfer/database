import { RpcInterface } from '../../rpc/rpc-interface';
import { RequestRouter } from '../../routing/types/request-router';
import { Unsubscribable } from 'rxjs';

export interface RpcClientFactoryInterface<I, R> {
  createRpcClient(router: RequestRouter<I, R>): Promise<RpcInterface<I> & Unsubscribable>;
}
