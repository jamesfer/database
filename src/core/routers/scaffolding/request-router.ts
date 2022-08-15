import { Request } from './request';
import { Response } from './response';

export type RequestRouter<R extends Request> = (request: R) => Promise<Response>;
