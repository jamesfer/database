import { switchRouter } from './utils/switch-router';
import { RequestCategory } from './types/request-category';
import { RpcInterface } from '../rpc/rpc-interface';
import { ProcessManager } from '../core/process-manager';
import { ProcessControlRequest, processControlRouter } from './process-control-router';
import { allConfigAddressedRequestRouter } from './requests/config-addressed/all-config-addressed-request-router';
import { allProcessAddressedRequestRouter } from './requests/process-addressed/all-process-addressed-request-router';
import { ConfigAddressedRequest } from './requests/config-addressed/config-addressed-request';
import { ProcessAddressedRequest } from './requests/process-addressed/process-addressed-request';
import { MetadataTemporaryRequest } from './requests/metadata-temporary-request';
import { makeMetadataTemporaryRouter } from './metadata-temporary-router';
import { MetadataManager } from '../core/metadata-state/metadata-manager';
import { DistributedCommitLogFactory } from '../types/distributed-commit-log-factory';
import { ConfigEntry } from '../config/config-entry';
import { Observable } from 'rxjs';
import { RequestRouter } from './types/request-router';

export type AnyRequest =
  | ConfigAddressedRequest
  | ProcessAddressedRequest
  | ProcessControlRequest
  | MetadataTemporaryRequest;

const wrapWithDiagnostics = (requestRouter: RequestRouter<AnyRequest>): RequestRouter<AnyRequest> => async (request: AnyRequest) => {
  try {
    const response = await requestRouter(request);
    // console.log('[DiagnosticMiddleware] response', response);
    return response;
  } catch (error) {
    // console.log('[DiagnosticMiddleware] error', error.toString(), (error as any).stack);
    throw error;
  }
}

export const allRequestRouter = (
  nodeId: string,
  rpcInterface: RpcInterface<AnyRequest>,
  processManager: ProcessManager,
  metadataManager: MetadataManager,
  distributedCommitLogFactory: DistributedCommitLogFactory<ConfigEntry>,
  nodes$: Observable<string[]>,
): RequestRouter<AnyRequest> => wrapWithDiagnostics(switchRouter('category')({
  [RequestCategory.ConfigAction]: allConfigAddressedRequestRouter(rpcInterface, metadataManager),
  [RequestCategory.ProcessAction]: allProcessAddressedRequestRouter(nodeId, processManager, rpcInterface),
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
