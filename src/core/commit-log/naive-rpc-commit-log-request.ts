import { FullyQualifiedPath } from '../../config/config';

export interface NaiveRpcCommitLogRequest<T> {
  nodeId: string;
  path: FullyQualifiedPath;
  value: T;
}
