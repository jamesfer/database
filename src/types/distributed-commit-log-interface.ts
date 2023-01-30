import { Observable } from 'rxjs';
import { FullyQualifiedPath } from '../core/metadata-state/config';

export interface DistributedCommitLogInterface<T> {
  readonly commits$: Observable<[FullyQualifiedPath, T]>;
  readonly isLeader$: Observable<boolean>;
  write(path: FullyQualifiedPath, value: T): Promise<void>;
}
