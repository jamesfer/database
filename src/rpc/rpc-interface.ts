import { Response } from '../routing/types/response';

export interface RpcInterface<R> {
  // TODO add better typing to return type
  makeRequest(request: R): Promise<Response>;
}
