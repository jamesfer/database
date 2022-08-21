import { sample } from 'lodash';
import { Response } from '../../src/core/routers/scaffolding/response';
import { RPCInterface } from '../../src/types/rpc-interface';
import { RequestRouter } from '../../src/core/routers/scaffolding/request-router';
import { RequestCategory } from '../../src/core/routers/scaffolding/request-category';
import { AnyRequest } from '../../src/core/routers/combined-router';
import { assertNever } from '../../src/utils/assert-never';

export class InMemoryRpcInterface implements RPCInterface<AnyRequest> {
  private routers: { [k: string]: RequestRouter<AnyRequest> } = {};

  registerRouter(nodeId: string, router: RequestRouter<AnyRequest>) {
    this.routers[nodeId] = router;
  }

  async makeRequest(request: AnyRequest): Promise<Response> {
    switch (request.category) {
      case RequestCategory.ProcessControl:
      case RequestCategory.ProcessAction: {
        const matchingNodeRouter: RequestRouter<AnyRequest> | undefined = this.routers[request.targetNodeId];
        if (!matchingNodeRouter) {
          throw new Error(`Can not find target node id: ${request.targetNodeId} in list`);
        }

        return matchingNodeRouter(request);
      }

      case RequestCategory.ConfigAction: {
        // Pick a random router
        const router = sample(this.routers);
        if (!router) {
          throw new Error('There are no routers registered');
        }

        return router(request);
      }

      default:
        assertNever(request);
    }
  }
}
