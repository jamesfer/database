import { Request as ExpressRequest } from 'express';
import { Request } from '../../core/requests/request';

export class ExpressRequestAdaptor implements Request {
  constructor(private readonly expressRequest: ExpressRequest) {}

  getBodyAsArrayBuffer(): ArrayBuffer {
    return this.expressRequest.body
  }

  getBodyAsString(): string {
    return this.expressRequest.body.toString();
  }

  getField(key: string): any {
    if (key in this.expressRequest.params) {
      return this.expressRequest.params[key];
    }

    if (key in this.expressRequest.query) {
      return this.expressRequest.query;
    }

    return undefined;
  }
}
