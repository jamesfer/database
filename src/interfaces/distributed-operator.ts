import { Observable } from 'rxjs';
import { FullyQualifiedPath } from '../core/metadata-state/config';

export interface DistributedOperator<T> {
  distributedOperator(
    path: FullyQualifiedPath,
    events$: Observable<T>
  ): Observable<void>;
}
