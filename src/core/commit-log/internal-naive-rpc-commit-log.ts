import { DistributedCommitLogInterface } from '../../types/distributed-commit-log-interface';
import { NaiveRpcCommitLogRequest } from './naive-rpc-commit-log-request';
import { RpcInterface } from '../../rpc/rpc-interface';
import { FullyQualifiedPath } from '../metadata-state/config';
import { concat, NEVER, of, Subject, Unsubscribable } from 'rxjs';
import { SequentialTaskExecutor } from './sequential-task-executor';

export class InternalNaiveRpcCommitLog<T> implements DistributedCommitLogInterface<T>, Unsubscribable {
  static async initialize<T>(
    rpcInterface: RpcInterface<NaiveRpcCommitLogRequest<T>>,
    nodeId: string,
    staticLeaderId: string,
    clusterNodes: string[],
  ): Promise<InternalNaiveRpcCommitLog<T>> {
    return new InternalNaiveRpcCommitLog<T>(rpcInterface, nodeId, staticLeaderId, clusterNodes);
  }

  private readonly taskExecutor = new SequentialTaskExecutor();
  private readonly commitsSubject$ = new Subject<[FullyQualifiedPath, T]>();
  private readonly isLeader = this.nodeId === this.staticLeaderId;

  readonly isLeader$ = concat(of(this.isLeader), NEVER);
  readonly commits$ = this.commitsSubject$.asObservable();

  private constructor(
    private readonly rpcInterface: RpcInterface<NaiveRpcCommitLogRequest<T>>,
    private readonly nodeId: string,
    private readonly staticLeaderId: string,
    private readonly clusterNodes: string[],
  ) {}

  async write(path: FullyQualifiedPath, value: T): Promise<void> {
    if (!this.isLeader) {
      // Send the request to the leader
      await this.rpcInterface.makeRequest({ path, value, nodeId: this.staticLeaderId });
    }

    // Save the event to this node
    this.processCommittedLog(path, value);

    // Publish the event to all other nodes using a sequential
    // task executor to maintain order
    await this.taskExecutor.enqueueTask(() => Promise.all(
      this.clusterNodes
        .filter(otherNode => otherNode !== this.nodeId)
        .map(async otherNode => {
          return this.rpcInterface.makeRequest({ path, value, nodeId: otherNode });
        }),
    ));
  }

  /**
   * Increment the current version and add another commit to the log.
   * In Javascript, this is an atomic operation.
   */
  processCommittedLog(path: FullyQualifiedPath, value: T): void {
    // this.currentVersion += 1;
    this.commitsSubject$.next([path, value]);
    // return this.currentVersion;
  }

  unsubscribe(): void {
    this.commitsSubject$.complete();
    this.taskExecutor.unsubscribe();
  }

  // private writeCommitAsFollower(path: FullyQualifiedPath, value: T, version: number) {
  //
  // }
  //
  // private writeCommitAsLeader(path: FullyQualifiedPath, value: T): number {
  //   this.currentVersion += 1;
  //   this.commitsSubject$.next([path, value]);
  //   return this.currentVersion;
  // }
}
