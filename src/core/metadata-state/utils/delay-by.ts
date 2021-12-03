import { Observable, timer } from 'rxjs';
import { switchMapTo } from 'rxjs/operators';

export function delayBy<T>(time: number, observable$: Observable<T>): Observable<T> {
  return timer(time).pipe(switchMapTo(observable$));
}
