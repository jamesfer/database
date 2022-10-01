import { Response } from '../routing/types/response';
import { BaseRequest } from '../routing/requests/base-request';

export interface RpcInterface<R extends BaseRequest> {
  makeRequest(request: R): Promise<Response>;
}
