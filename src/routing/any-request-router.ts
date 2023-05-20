import { switchRouter } from './utils/switch-router';
import { RequestCategory } from './actions/request-category';
import { RpcInterface } from '../rpc/rpc-interface';
import { ProcessManager } from '../core/process-manager';
import { processControlRouter } from './actions/process-control/process-control-router';
import { configAddressedRequestRouter } from './routers/config-addressed-request-router';
import { anyProcessAddressedRequestRouter } from './actions/process-addressed/any-process-addressed-request-router';
import { makeMetadataTemporaryRouter } from './actions/metadata-temporary/metadata-temporary-router';
import { MetadataManager } from '../core/metadata-state/metadata-manager';
import { DistributedCommitLogFactory } from '../types/distributed-commit-log-factory';
import { Observable } from 'rxjs';
import { AllComponentConfigurations } from '../components/scaffolding/all-component-configurations';
import { AnyRequestResponse } from './actions/any-request-response';
import { AnyResponse } from './actions/any-response';

const wrapWithDiagnostics = (
  requestRouter: (request: AnyRequestResponse) => Promise<AnyResponse>,
) => async (
  request: AnyRequestResponse,
): Promise<AnyResponse> => {
  try {
    const response = await requestRouter(request);
    // console.log('[DiagnosticMiddleware] response', response);
    return response;
  } catch (error) {
    console.log('[DiagnosticMiddleware] request:', request, 'caused error:', (error as any).toString(), (error as any).stack);
    throw error;
  }
}

export const anyRequestRouter = (
  nodeId: string,
  rpcInterface: RpcInterface<AnyRequestResponse>,
  processManager: ProcessManager,
  metadataManager: MetadataManager,
  distributedCommitLogFactory: DistributedCommitLogFactory<AllComponentConfigurations>,
  nodes$: Observable<string[]>,
): (request: AnyRequestResponse) => Promise<AnyResponse> => wrapWithDiagnostics(switchRouter('category')({
  [RequestCategory.Config]: configAddressedRequestRouter(rpcInterface, metadataManager),
  [RequestCategory.Process]: anyProcessAddressedRequestRouter(nodeId, processManager, rpcInterface),
  [RequestCategory.ProcessControl]: processControlRouter(nodeId, rpcInterface, processManager),
  [RequestCategory.MetadataTemporary]: makeMetadataTemporaryRouter(
    nodeId,
    metadataManager,
    distributedCommitLogFactory,
    processManager,
    rpcInterface,
    nodes$,
  ),
}));
