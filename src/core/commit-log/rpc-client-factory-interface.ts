import { RpcInterface } from '../../rpc/rpc-interface';
import { RequestRouter } from '../../routing/types/request-router';
import { Unsubscribable } from 'rxjs';

export interface RpcClientFactoryInterface<R> {
  createRpcClient(router: RequestRouter<R>): Promise<RpcInterface<R> & Unsubscribable>;
}
