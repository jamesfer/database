import { switchRouter } from './utils/switch-router';
import { RequestCategory } from './types/request-category';
import { RPCInterface } from '../types/rpc-interface';
import { ProcessManager } from '../core/process-manager';
import { ProcessControlRequest, processControlRouter } from './process-control-router';
import { allConfigAddressedRequestRouter } from './requests/config-addressed/all-config-addressed-request-router';
import { allProcessAddressedRequestRouter } from './requests/process-targeting/all-process-addressed-request-router';
import { ConfigAddressedRequest } from './requests/config-addressed/config-addressed-request';
import { ProcessAddressedRequest } from './requests/process-targeting/process-addressed-request';
import { MetadataDispatcherInterface } from '../types/metadata-dispatcher-interface';

export type AnyRequest =
  | ConfigAddressedRequest
  | ProcessAddressedRequest
  | ProcessControlRequest;

export const allRequestRouter = (
  nodeId: string,
  rpcInterface: RPCInterface<AnyRequest>,
  metadataDispatcher: MetadataDispatcherInterface,
  processManager: ProcessManager,
) => switchRouter('category')<AnyRequest>({
  [RequestCategory.ConfigAction]: allConfigAddressedRequestRouter(rpcInterface, metadataDispatcher),
  [RequestCategory.ProcessAction]: allProcessAddressedRequestRouter(nodeId, processManager, rpcInterface),
  [RequestCategory.ProcessControl]: processControlRouter(nodeId, rpcInterface, processManager),
});
