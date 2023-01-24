import { sample } from 'lodash';
import { Response } from '../../src/routing/types/response';
import { RpcInterface } from '../../src/rpc/rpc-interface';
import { RequestRouter } from '../../src/routing/types/request-router';
import { RequestCategory } from '../../src/routing/types/request-category';
import { AnyRequest } from '../../src/routing/unified-request-router';
import { assertNever } from '../../src/utils/assert-never';

export class InMemoryRpcInterface implements RpcInterface<AnyRequest> {
  private routers: { [k: string]: RequestRouter<AnyRequest> } = {};

  registerRouter(nodeId: string, router: RequestRouter<AnyRequest>) {
    this.routers[nodeId] = router;
  }

  async makeRequest(request: AnyRequest): Promise<Response> {
    switch (request.category) {
      case RequestCategory.MetadataTemporary:
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
