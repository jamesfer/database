import { DistributedCommitLogInterface } from './distributed-commit-log-interface';

export interface DistributedCommitLogFactory<T> {
  createDistributedCommitLog(nodeId: string): Promise<DistributedCommitLogInterface<T>>;
}
