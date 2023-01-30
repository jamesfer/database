import { Response } from '../routing/types/response';

export interface RpcInterface<R> {
  makeRequest(request: R): Promise<Response>;
}
