import { Request, RequestType } from '../../src/core/routers/scaffolding/request';
import { Response } from '../../src/core/routers/scaffolding/response';
import { RPCInterface } from '../../src/types/rpc-interface';
import { RequestRouter } from '../../src/core/routers/scaffolding/request-router';
import { sample } from 'lodash';

export class InMemoryRpcInterface<R extends Request> implements RPCInterface<R> {
  private routers: { [k: string]: RequestRouter<R> } = {};

  registerRouter(nodeId: string, router: RequestRouter<R>) {
    this.routers[nodeId] = router;
  }

  async makeRequest(request: R): Promise<Response> {
    switch (request.target.type) {
      case RequestType.Node: {
        const matchingRouter: RequestRouter<R> | undefined = this.routers[request.target.nodeId];
        if (!matchingRouter) {
          throw new Error('Can not find target node id: ' + request.target.nodeId + ' in list');
        }

        return matchingRouter(request);
      }

      case RequestType.Path: {
        // Pick a random router
        const router = sample(this.routers);
        if (!router) {
          throw new Error('There are no routers registered');
        }

        return router(request);
      }
    }


  }
}
