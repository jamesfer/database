import { Response as ExpressResponse } from 'express';
import { DataResponse, FailureResponse, FailureType, OkResponse, Response } from '../../core/responses/response';
import { assertNever } from '../../utils/assert-never';

export function handleResponse(expressResponse: ExpressResponse, genericResponse: Response): void {
  if (genericResponse instanceof OkResponse) {
    expressResponse.sendStatus(200);
  } else if (genericResponse instanceof FailureResponse) {
    switch (genericResponse.type) {
      case FailureType.notFound:
        expressResponse.status(404);
        break;
      default:
        assertNever(genericResponse.type);
    }
    expressResponse.send(genericResponse.message);
  } else if (genericResponse instanceof DataResponse) {
    expressResponse.status(200);
    expressResponse.send(genericResponse.data);
  }
}
