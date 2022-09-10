import { Response } from '../routing/types/response';
import { BaseRequest } from '../routing/requests/base-request';

export interface RPCInterface<R extends BaseRequest> {
  makeRequest(request: BaseRequest): Promise<Response>;
}
