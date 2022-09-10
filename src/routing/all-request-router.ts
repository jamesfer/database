import { switchRouter } from './utils/switch-router';
import { RequestCategory } from './types/request-category';
import { RPCInterface } from '../types/rpc-interface';
import { ProcessManager } from '../core/process-manager';
import { MetadataDispatcherFacade } from '../facades/metadata-dispatcher-facade';
import { ProcessControlRequest, processControlRouter } from './process-control-router';
import { combinedConfigActionRouter, ConfigActionRequest } from './combined-config-action-router';
import { combinedProcessActionRouter, ProcessActionRequest } from './combined-process-action-router';

export type AnyRequest =
  | ConfigActionRequest
  | ProcessActionRequest
  | ProcessControlRequest;

export const allRequestRouter = (
  nodeId: string,
  rpcInterface: RPCInterface<AnyRequest>,
  metadataDispatcher: MetadataDispatcherFacade,
  processManager: ProcessManager,
) => switchRouter('category')<AnyRequest>({
  [RequestCategory.ConfigAction]: combinedConfigActionRouter(rpcInterface, metadataDispatcher),
  [RequestCategory.ProcessAction]: combinedProcessActionRouter(nodeId, processManager),
  [RequestCategory.ProcessControl]: processControlRouter(nodeId, processManager),
});
