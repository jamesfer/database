import { Response } from '../routing/types/response';
import { BaseRequest } from '../routing/requests/base-request';
import { Observable } from 'rxjs';

export interface BidirectionalRpcInterface<I, O> {
  incomingRequests$: Observable<I>;
  makeRequest(request: O): Promise<Response>;
}
