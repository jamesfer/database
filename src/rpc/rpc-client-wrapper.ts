import { RpcInterface } from './rpc-interface';
import { Response } from '../routing/types/response';
import { BaseRequest } from '../routing/actions/base-request';

export class RpcClientWrapper<R extends BaseRequest> implements RpcInterface<R> {
  private rpcClient: RpcInterface<R> | undefined;

  async makeRequest(request: R): Promise<Response> {
    if (!this.rpcClient) {
      throw new Error('RpcClientWrapper does not have a registered client');
    }
    return this.rpcClient.makeRequest(request);
  }

  registerClient(rpcClient: RpcInterface<R>): void {
    this.rpcClient = rpcClient;
  }
}
