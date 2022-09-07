import { Response } from '../core/routers/scaffolding/response';
import { BaseRequest } from '../core/routers/scaffolding/base-request';

export interface RPCInterface<R extends BaseRequest> {
  makeRequest(request: BaseRequest): Promise<Response>;
}
