import { Response } from './response';

export type RequestRouter<R> = (request: R) => Promise<Response>;
