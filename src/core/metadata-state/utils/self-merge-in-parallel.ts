import { merge, Observable, OperatorFunction } from 'rxjs';
import { publish } from 'rxjs/operators';

export const selfMergeInParallel = <T, R>(
  ...operators: OperatorFunction<T, R>[]
): OperatorFunction<T, R> => (
  publish<T, Observable<R>>(multicasted$ => (
    merge(multicasted$, ...operators.map(operator => operator(multicasted$)))
  ))
)
