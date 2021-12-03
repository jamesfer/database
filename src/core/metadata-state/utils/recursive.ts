import { Observable, Subject } from 'rxjs';
import { multicast } from 'rxjs/operators';

export const recursive = <T>(constructor: (observable: Observable<T>) => Observable<T>) => (observable: Observable<T>): Observable<T> => {
  return new Observable<T>((subscriber) => {
    const internal$ = new Subject<T>();
    const outerSubscription = observable.subscribe(internal$);
    const connectableResult$ = multicast(() => internal$)(constructor(internal$));
    const connectSubscription = connectableResult$.connect();
    const outputSubscription = connectableResult$.subscribe(subscriber);
    return () => {
      outerSubscription.unsubscribe();
      connectSubscription.unsubscribe();
      outputSubscription.unsubscribe();
    };
  });
}
