import { KeyValueProcessRequest, keyValueProcessRouter } from './key-value-process-router';
import { KeyValueConfigRequest, keyValueConfigRouter } from './key-value-config-router';
import { switchRouter } from './scaffolding/switch-router';
import { AllRouterCategories } from './all-router-categories';
import { RPCInterface } from '../../types/rpc-interface';
import { ProcessManager } from '../process-manager';
import { MetadataDispatcherFacade } from '../../facades/metadata-dispatcher-facade';
import { ProcessControlRequest, processControlRouter } from './process-control-router';

export type AnyRequest =
  | KeyValueProcessRequest
  | KeyValueConfigRequest
  | ProcessControlRequest

export const allRouter = (
  nodeId: string,
  rpcInterface: RPCInterface<AnyRequest>,
  metadataDispatcher: MetadataDispatcherFacade,
  processManager: ProcessManager,
) => switchRouter('category')<AnyRequest>({
  [AllRouterCategories.KeyValueConfig]: keyValueConfigRouter(metadataDispatcher, rpcInterface),
  [AllRouterCategories.KeyValueProcess]: keyValueProcessRouter(nodeId, processManager),
  [AllRouterCategories.ProcessControl]: processControlRouter(processManager),
});
