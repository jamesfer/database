import express from 'express';
import fetch from 'node-fetch';
import { BidirectionalRpcInterface } from '../types/bidirectional-rpc-interface';
import { Codec } from '../types/codec';
import { Observable, Subject, Subscriber, TeardownLogic, Unsubscribable } from 'rxjs';
import { concatMap } from 'rxjs/operators';

const buildExpressApi = (port: number) => (subscriber: Subscriber<string>): TeardownLogic => {
  const app = express();
  app.use(express.text());
  app.post('/', req => {
    const body = req.body;
    if (typeof body === 'string') {
      subscriber.next(body);
    }
  });

  const server = app.listen(port);
  return () => server.close();
}

export class HttpRpcInterface<I, O extends I> implements BidirectionalRpcInterface<I, O>, Unsubscribable {
  static async initialize<I, O extends I>(
    ownHost: string,
    codecI: Codec<I, string>,
    codecO: Codec<O, string>,
    httpPort: number,
    hostResolver: (outgoing: O) => string,
  ): Promise<HttpRpcInterface<I, O>> {
    return new HttpRpcInterface<I, O>(ownHost, codecI, codecO, httpPort, hostResolver);
  }

  private readonly externallyIncomingRequests = new Observable(buildExpressApi(this.httpPort)).pipe(
    concatMap(stringRequest => this.codecI.deserialize(stringRequest)),
    concatMap(maybeRequest => maybeRequest == undefined ? [] : [maybeRequest]),
  );

  private readonly incomingRequestsSubject = new Subject<I>();

  private readonly incomingRequestsSubscription = this.externallyIncomingRequests.subscribe(this.incomingRequestsSubject);

  readonly incomingRequests$ = this.incomingRequestsSubject.asObservable();

  private constructor(
    private readonly ownHost: string,
    private readonly codecI: Codec<I, string>,
    private readonly codecO: Codec<O, string>,
    private readonly httpPort: number,
    private readonly hostResolver: (outgoing: O) => string,
  ) {}

  unsubscribe(): void {
    this.incomingRequestsSubscription.unsubscribe();
  }

  async makeRequest(request: O): Promise<string> {
    const address = this.hostResolver(request);
    if (address === this.ownHost) {
      this.incomingRequestsSubject.next(request);
    }

    const serializedRequest = await this.codecO.serialize(request);
    return this.sendHttpRequest(address, serializedRequest);
  }

  private async sendHttpRequest(host: string, body: string): Promise<string> {
    const response = await fetch(`http://${host}:${this.httpPort}/`, {
      method: 'POST',
      body: body,
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }

    return response.text();
  }
}
