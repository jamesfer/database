import express from 'express';
import fetch from 'node-fetch';
import { Codec } from '../types/codec';
import { Subscription, TeardownLogic, Unsubscribable } from 'rxjs';
import { RequestRouter } from '../routing/types/request-router';
import { RpcInterface } from './rpc-interface';

export const LOCAL: unique symbol = Symbol('LOCAL');

export type HttpUrlResolver<O> = (outgoing: O) => string | typeof LOCAL;

function buildExpressApi(port: number, handler: (body: string) => Promise<string>): TeardownLogic {
  const app = express();
  app.use(express.text());
  app.post('/', (req, res) => {
    const body = req.body;
    if (typeof body === 'string') {
      handler(body)
        .then(response => res.status(200).send(response))
        .catch(err => res.status(500).send(err.toString()))
    } else {
      console.error(`Unknown body type: ${body}`);
    }
  });

  const server = app.listen(port);
  return () => server.close();
}

function buildApiWithRouter<I, R>(
  httpListenPort: number,
  codecI: Codec<I, string>,
  codecR: Codec<R, string>,
  router: RequestRouter<I, R>,
): TeardownLogic {
  return buildExpressApi(httpListenPort, async (stringRequest) => {
    const request = await codecI.deserialize(stringRequest);
    if (!request) {
      throw new Error(`Could not parse request: ${stringRequest}`);
    }

    const response = await router(request);
    return codecR.serialize(response);
  })
}

export class HttpRpcClient<I, O extends I, R> implements RpcInterface<O>, Unsubscribable {
  static async initialize<I, O extends I, R>(
    codecI: Codec<I, string>,
    codecO: Codec<O, string>,
    codecR: Codec<R, string>,
    httpListenPort: number,
    httpUrlResolver: HttpUrlResolver<O>,
    router: RequestRouter<I, R>,
  ): Promise<HttpRpcClient<I, O, R>> {
    return new HttpRpcClient<I, O, R>(codecI, codecO, codecR, httpListenPort, httpUrlResolver, router);
  }

  private readonly apiTeardownLogic = new Subscription();

  private constructor(
    private readonly codecI: Codec<I, string>,
    private readonly codecO: Codec<O, string>,
    private readonly codecR: Codec<R, string>,
    private readonly httpListenPort: number,
    private readonly httpUrlResolver: HttpUrlResolver<O>,
    private readonly router: RequestRouter<I, R>,
  ) {
    this.apiTeardownLogic.add(buildApiWithRouter(
      this.httpListenPort,
      this.codecI,
      this.codecR,
      this.router,
    ));
  }

  unsubscribe(): void {
    this.apiTeardownLogic.unsubscribe();
  }

  async makeRequest(request: O): Promise<string> {
    const url = this.httpUrlResolver(request);
    if (url === LOCAL) {
      // Run the router locally
      const response = await this.router(request);
      return this.codecR.serialize(response);
    }

    const serializedRequest = await this.codecO.serialize(request);
    return this.sendHttpRequest(url, serializedRequest);
  }

  private async sendHttpRequest(url: string, body: string): Promise<string> {
    const response = await fetch(url, {
      method: 'POST',
      body: body,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${await response.text()}`);
    }

    return response.text();
  }
}
