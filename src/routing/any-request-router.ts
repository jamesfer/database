import { switchRouter } from './utils/switch-router';
import { RequestCategory } from './types/request-category';
import { RpcInterface } from '../rpc/rpc-interface';
import { ProcessManager } from '../core/process-manager';
import { processControlRouter } from './requests/process-control/process-control-router';
import { configAddressedRequestRouter } from './requests/config-addressed/config-addressed-request-router';
import { anyProcessAddressedRequestRouter } from './requests/process-addressed/any-process-addressed-request-router';
import { makeMetadataTemporaryRouter } from './requests/metadata-temporary/metadata-temporary-router';
import { MetadataManager } from '../core/metadata-state/metadata-manager';
import { DistributedCommitLogFactory } from '../types/distributed-commit-log-factory';
import { Observable } from 'rxjs';
import { RequestRouter } from './types/request-router';
import { AnyRequest } from './requests/any-request';
import { AnyComponentConfiguration } from '../components/any-component-configuration';

const wrapWithDiagnostics = (requestRouter: RequestRouter<AnyRequest>): RequestRouter<AnyRequest> => async (request: AnyRequest) => {
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
  rpcInterface: RpcInterface<AnyRequest>,
  processManager: ProcessManager,
  metadataManager: MetadataManager,
  distributedCommitLogFactory: DistributedCommitLogFactory<AnyComponentConfiguration>,
  nodes$: Observable<string[]>,
): RequestRouter<AnyRequest> => wrapWithDiagnostics(switchRouter('category')({
  [RequestCategory.ConfigAction]: configAddressedRequestRouter(rpcInterface, metadataManager),
  [RequestCategory.ProcessAction]: anyProcessAddressedRequestRouter(nodeId, processManager, rpcInterface),
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
