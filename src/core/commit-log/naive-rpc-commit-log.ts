import { DistributedCommitLogInterface } from '../../types/distributed-commit-log-interface';
import { Observable, Unsubscribable } from 'rxjs';
import { FullyQualifiedPath } from '../metadata-state/config';
import { InternalNaiveRpcCommitLog } from './internal-naive-rpc-commit-log';
import { RpcInterface } from '../../rpc/rpc-interface';
import { NaiveRpcCommitLogRequest } from './naive-rpc-commit-log-request';
import { RpcClientFactoryInterface } from './rpc-client-factory-interface';
import { RpcClientWrapper } from '../../rpc/rpc-client-wrapper';
import { makeNaiveRpcCommitLogRouter } from './naive-rpc-commit-log-router';

export class NaiveRpcCommitLog<T> implements DistributedCommitLogInterface<T>, Unsubscribable {
  static async initialize<T>(
    rpcClientFactory: RpcClientFactoryInterface<NaiveRpcCommitLogRequest<T>, any>,
    nodeId: string,
    staticLeaderId: string,
    clusterNodes: string[],
  ): Promise<NaiveRpcCommitLog<T>> {
    const rpcClientWrapper = new RpcClientWrapper<NaiveRpcCommitLogRequest<T>>();
    const internalNaiveRpcCommitLog = await InternalNaiveRpcCommitLog.initialize<T>(
        rpcClientWrapper,
        nodeId,
        staticLeaderId,
        clusterNodes,
      );
    const rpcClient = await rpcClientFactory.createRpcClient(
      makeNaiveRpcCommitLogRouter(internalNaiveRpcCommitLog),
    );
    rpcClientWrapper.registerClient(rpcClient);

    return new NaiveRpcCommitLog<T>(
      internalNaiveRpcCommitLog,
      rpcClient,
    );
  }

  readonly commits$: Observable<[FullyQualifiedPath, T]> = this.internalNaiveRpcCommitLog.commits$;
  readonly isLeader$: Observable<boolean> = this.internalNaiveRpcCommitLog.isLeader$;

  constructor(
    private readonly internalNaiveRpcCommitLog: InternalNaiveRpcCommitLog<T>,
    private readonly rpcClient: RpcInterface<NaiveRpcCommitLogRequest<T>> & Unsubscribable,
  ) {}

  async write(path: FullyQualifiedPath, value: T): Promise<void> {
    return this.internalNaiveRpcCommitLog.write(path, value);
  }

  unsubscribe(): void {
    this.internalNaiveRpcCommitLog.unsubscribe();
    this.rpcClient.unsubscribe();
  }
}
