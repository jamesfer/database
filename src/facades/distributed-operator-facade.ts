import { Observable } from 'rxjs';
import { ProcessManager } from '../core/process-manager';
import { MetadataDispatcherInterface } from '../types/metadata-dispatcher-interface';
import { RpcInterface } from '../rpc/rpc-interface';
import { AnyRequest } from '../routing/unified-request-router';
import { FullyQualifiedPath } from '../config/config';
import { AllComponentConfigurations } from '../components/scaffolding/all-component-configurations';

export const DISTRIBUTED_OPERATOR_FACADE_NAME = 'OPERATOR_FACADE' as const;

export type DISTRIBUTED_OPERATOR_FACADE_NAME = typeof DISTRIBUTED_OPERATOR_FACADE_NAME;

export interface ConfigLifecycle<C extends AllComponentConfigurations> {
  path: FullyQualifiedPath,
  name: C['NAME'];
  events$: Observable<C>;
}

export interface DistributedOperatorContext {
  nodeId: string;
  nodes$: Observable<string[]>;
  processManager: ProcessManager;
  metadataDispatcher: MetadataDispatcherInterface;
  rpcInterface: RpcInterface<AnyRequest>;
}

export interface DistributedOperatorFunction<C extends AllComponentConfigurations> {
  (context: DistributedOperatorContext, config: ConfigLifecycle<C>): Observable<void>;
}

export interface DistributedOperatorFacade<C extends AllComponentConfigurations> {
  distributedOperatorFunction: DistributedOperatorFunction<C>;
}

declare module './scaffolding/all-facades' {
  export interface AllFacades<C extends AllComponentConfigurations> {
    [DISTRIBUTED_OPERATOR_FACADE_NAME]: DistributedOperatorFacade<C>;
  }
}
