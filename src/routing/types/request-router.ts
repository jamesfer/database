export type RequestRouter<R, S> = (request: R) => Promise<S>;
