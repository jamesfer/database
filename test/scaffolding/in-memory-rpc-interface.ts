import { sample } from 'lodash';
import { Response } from '../../src/routing/types/response';
import { RpcInterface } from '../../src/rpc/rpc-interface';
import { RequestRouter } from '../../src/routing/types/request-router';
import { RequestCategory } from '../../src/routing/actions/request-category';
import { assertNever } from '../../src/utils/assert-never';
import { AnyRequestResponse } from '../../src/routing/actions/any-request-response';

export class InMemoryRpcInterface implements RpcInterface<AnyRequestResponse> {
  private routers: { [k: string]: RequestRouter<AnyRequestResponse> } = {};

  registerRouter(nodeId: string, router: RequestRouter<AnyRequestResponse>) {
    this.routers[nodeId] = router;
  }

  async makeRequest(request: AnyRequestResponse): Promise<Response> {
    switch (request.category) {
      case RequestCategory.ProcessControl:
      case RequestCategory.Process: {
        const matchingNodeRouter: RequestRouter<AnyRequestResponse> | undefined = this.routers[request.targetNodeId];
        if (!matchingNodeRouter) {
          throw new Error(`Can not find target node id: ${request.targetNodeId} in list`);
        }

        return matchingNodeRouter(request);
      }

      case RequestCategory.MetadataTemporary:
      case RequestCategory.Config: {
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
