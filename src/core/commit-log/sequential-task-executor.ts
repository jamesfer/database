import { Subject, Unsubscribable } from 'rxjs';
import { concatMap } from 'rxjs/operators';

type Task<T> = () => Promise<T>;

export class SequentialTaskExecutor implements Unsubscribable {
  private readonly tasks$ = new Subject<Task<any>>()

  private readonly taskExecutorSubscription = this.tasks$.pipe(
    concatMap(task => task()),
  ).subscribe();

  async enqueueTask<T>(task: Task<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.tasks$.next(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  unsubscribe(): void {
    this.taskExecutorSubscription.unsubscribe();
  }
}
