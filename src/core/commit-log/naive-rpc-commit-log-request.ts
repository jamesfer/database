import { FullyQualifiedPath } from '../metadata-state/config';

export interface NaiveRpcCommitLogRequest<T> {
  nodeId: string;
  path: FullyQualifiedPath;
  value: T;
}
