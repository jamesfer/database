import { Request } from '../core/routers/scaffolding/request';
import { Response } from '../core/routers/scaffolding/response';

export interface RPCInterface<R extends Request> {
  makeRequest(request: Request): Promise<Response>;
}
