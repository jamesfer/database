import { Response } from './response';
import { BaseRequest } from './base-request';

export type RequestRouter<R extends BaseRequest> = (request: R) => Promise<Response>;
