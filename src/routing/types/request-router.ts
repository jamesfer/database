import { Response } from './response';
import { BaseRequest } from '../requests/base-request';

export type RequestRouter<R extends BaseRequest> = (request: R) => Promise<Response>;
