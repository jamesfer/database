import { Observable, Subject } from 'rxjs';
import { multicast } from 'rxjs/operators';

export function createCircularObservable<T>(
  constructor: (input$: Observable<T>) => Observable<T>,
): Observable<T> {
  return new Observable<T>((subscriber) => {
    const internal$ = new Subject<T>();
    const connectableResult$ = multicast(() => internal$)(constructor(internal$));
    const connectSubscription = connectableResult$.connect();
    const outputSubscription = connectableResult$.subscribe(subscriber);
    return () => {
      connectSubscription.unsubscribe();
      outputSubscription.unsubscribe();
    };
  });
}
