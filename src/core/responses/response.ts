export class OkResponse {}

export enum FailureType {
  notFound,
}

export class FailureResponse {
  constructor(public readonly type: FailureType, public readonly message: string) {}
}

export class DataResponse {
  constructor(public readonly data: ArrayBuffer) {}
}

export type Response = OkResponse | FailureResponse | DataResponse;
