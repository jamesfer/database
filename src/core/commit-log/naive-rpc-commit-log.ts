import { DistributedCommitLogFactory } from '../../types/distributed-commit-log-factory';
import { DistributedCommitLogInterface } from '../../types/distributed-commit-log-interface';
import { of, Subject, Subscription, Unsubscribable } from 'rxjs';
import { NaiveRpcCommitLogRequest } from './naive-rpc-commit-log-request';
import { BidirectionalRpcInterface } from '../../types/bidirectional-rpc-interface';
import { FullyQualifiedPath } from '../../config/config';
import { makeNaiveRpcCommitLogRouter } from './naive-rpc-commit-log-router';
import { TeardownLogic } from 'rxjs/src/internal/types';

export class NaiveRpcCommitLog<T> implements DistributedCommitLogInterface<T> {
  static async initialize<T>(
    rpcInterface: BidirectionalRpcInterface<NaiveRpcCommitLogRequest<T>, NaiveRpcCommitLogRequest<T>>,
    nodeId: string,
    staticLeaderId: string,
    clusterNodes: string[],
  ): Promise<[NaiveRpcCommitLog<T>, TeardownLogic]> {
    const commitLog = new NaiveRpcCommitLog<T>(rpcInterface, nodeId, staticLeaderId, clusterNodes);
    const router = makeNaiveRpcCommitLogRouter(commitLog);
    const routerSubscription = rpcInterface.incomingRequests$.subscribe(router);
    return [commitLog, routerSubscription];
  }

  private readonly commitsSubject$ = new Subject<[FullyQualifiedPath, T]>();
  private readonly isLeader = this.nodeId === this.staticLeaderId;

  readonly isLeader$ = of(this.isLeader);
  readonly commits$ = this.commitsSubject$.asObservable();

  private constructor(
    private readonly rpcInterface: BidirectionalRpcInterface<NaiveRpcCommitLogRequest<T>, NaiveRpcCommitLogRequest<T>>,
    private readonly nodeId: string,
    private readonly staticLeaderId: string,
    private readonly clusterNodes: string[],
  ) {}

  async write(path: FullyQualifiedPath, value: T): Promise<void> {
    if (this.isLeader) {
      // Save the event to this node
      await this.processCommittedLog(path, value);

      // Publish the event to all other nodes
      await Promise.all(
        this.clusterNodes
          .filter(otherNode => otherNode !== this.nodeId)
          .map(otherNode => this.rpcInterface.makeRequest({ path, value, nodeId: otherNode })),
      );
    } else {
      // Send the request to the leader
      await this.rpcInterface.makeRequest({ path, value, nodeId: this.staticLeaderId });
    }
  }

  async processCommittedLog(path: FullyQualifiedPath, value: T) {
    this.commitsSubject$.next([path, value]);
  }
}

export class NaiveRPCCommitLogFactory<T> implements DistributedCommitLogFactory<T>, Unsubscribable {
  private readonly globalSubscription = new Subscription();

  constructor(
    private readonly rpcInterface: BidirectionalRpcInterface<NaiveRpcCommitLogRequest<T>, NaiveRpcCommitLogRequest<T>>,
    private readonly nodeId: string,
    private readonly staticLeaderId: string,
    private readonly clusterNodes: string[],
  ) {}

  async createDistributedCommitLog(nodeId: string): Promise<NaiveRpcCommitLog<T>> {
    const [commitLog, cleanup] = await NaiveRpcCommitLog.initialize(
      this.rpcInterface,
      this.nodeId,
      this.staticLeaderId,
      this.clusterNodes,
    );
    this.globalSubscription.add(cleanup);
    return commitLog;
  }

  unsubscribe(): void {
    this.globalSubscription.unsubscribe();
  }
}
