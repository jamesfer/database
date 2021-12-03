import { merge, Observable, OperatorFunction } from 'rxjs';
import { publish } from 'rxjs/operators';

export const mergeInParallel = <T, R>(
  ...operators: OperatorFunction<T, R>[]
): OperatorFunction<T, R> => (
  publish<T, Observable<R>>(multicasted$ => (
    merge(...operators.map(operator => operator(multicasted$)))
  ))
)
