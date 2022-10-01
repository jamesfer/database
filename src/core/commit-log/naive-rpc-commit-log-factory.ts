import { DistributedCommitLogFactory } from '../../types/distributed-commit-log-factory';
import { NaiveRpcCommitLogRequest } from './naive-rpc-commit-log-request';
import { NaiveRpcCommitLog } from './naive-rpc-commit-log';
import { RpcClientFactoryInterface } from './rpc-client-factory-interface';
import { Subscription, Unsubscribable } from 'rxjs';

export class NaiveRPCCommitLogFactory<T> implements DistributedCommitLogFactory<T>, Unsubscribable {
  private readonly subscription = new Subscription();

  constructor(
    private readonly rpcClientFactory: RpcClientFactoryInterface<NaiveRpcCommitLogRequest<T>>,
    private readonly nodeId: string,
    private readonly staticLeaderId: string,
    private readonly clusterNodes: string[],
  ) {}

  async createDistributedCommitLog(nodeId: string): Promise<NaiveRpcCommitLog<T>> {
    const commitLog = await NaiveRpcCommitLog.initialize(
      this.rpcClientFactory,
      this.nodeId,
      this.staticLeaderId,
      this.clusterNodes,
    );
    this.subscription.add(commitLog);
    return commitLog;
  }

  unsubscribe(): void {
    this.subscription.unsubscribe();
  }
}
