import { BehaviorSubject } from 'rxjs';
import { LifecycleControllerConfigEntry } from './lifecycle-controller-config-entry';
import { STREAMING_DATASTORE_FLAG, StreamingDatastore } from '../../facades/streaming-datastore';
import { BaseFacade, FACADE_FLAGS } from '../../facades/scaffolding/base-facade';
import { ProcessManager } from '../../core/process-manager';

export class LifecycleController implements BaseFacade, StreamingDatastore {
  readonly [FACADE_FLAGS]: {
    [STREAMING_DATASTORE_FLAG]: LifecycleController
  } = {
    [STREAMING_DATASTORE_FLAG]: this,
  };

  private secondaryStorageStartPoint: number = 0;

  public static async initialize(
    registry: ProcessManager,
    id: string,
    configState$: BehaviorSubject<LifecycleControllerConfigEntry>,
  ): Promise<LifecycleController> {
    const initialStorage = registry.getProcessByIdAs(configState$.value.initialStorage, STREAMING_DATASTORE_FLAG);
    if (!initialStorage) {
      throw new Error('Initial storage does not support StreamingDatastore facade');
    }

    const secondaryStorage = registry.getProcessByIdAs(configState$.value.secondaryStorage, STREAMING_DATASTORE_FLAG);
    if (!secondaryStorage) {
      throw new Error('Secondary storage does not support StreamingDatastore facade');
    }

    return new LifecycleController(
      // registry,
      id,
      initialStorage,
      secondaryStorage,
      configState$,
    );

    // const ageBehaviour$ = new BehaviorSubject(configState$.value.age);
    // configState$.pipe(map(state => state.age)).subscribe(ageBehaviour$);
    // const initialStorageBehaviour$ = new BehaviorSubject(configState$.value.initialStorage);
    // configState$.pipe(map(state => state.initialStorage)).subscribe(initialStorageBehaviour$);
    // const secondaryStorageBehaviour$ = new BehaviorSubject(configState$.value.secondaryStorage);
    // configState$.pipe(map(state => state.secondaryStorage)).subscribe(secondaryStorageBehaviour$);
  }

  private constructor(
    // private readonly registry: Registry,
    private readonly id: string,
    private readonly initialStorage: StreamingDatastore,
    private readonly secondaryStorage: StreamingDatastore,
    private readonly config$: BehaviorSubject<LifecycleControllerConfigEntry>,
    // private readonly age$: BehaviorSubject<number>,
    // private readonly initialStorage$: BehaviorSubject<FullyQualifiedPath>,
    // private readonly secondaryStorage$: BehaviorSubject<FullyQualifiedPath>,
  ) {}

  async readAfter(timestamp: number, count: number): Promise<ArrayBuffer[]> {
    // If the entire request is in the secondary, just use that
    if (timestamp >= this.secondaryStorageStartPoint) {
      return await this.secondaryStorage.readAfter(
        this.secondaryStorageStartPoint,
        count,
      );
    }

    // Otherwise, start by querying the initial storage
    const initialResults = await this.initialStorage.readAfter(timestamp, count);

    // If there are enough results, we are done, otherwise we need to query the secondary storage
    if (initialResults.length >= count) {
      return initialResults;
    }

    const secondaryResult = await this.secondaryStorage.readAfter(
      this.secondaryStorageStartPoint,
      count - initialResults.length,
    );
    return [...initialResults, ...secondaryResult];
  }

  async read(from: number, to: number): Promise<ArrayBuffer[]> {
    // Read from both initial and secondary in parallel
    const initialResultsPromise: Promise<ArrayBuffer[]> = from < this.secondaryStorageStartPoint
      ? this.initialStorage.read(from, Math.min(to, this.secondaryStorageStartPoint))
      : Promise.resolve([]);
    const secondaryResultsPromise: Promise<ArrayBuffer[]> = to >= this.secondaryStorageStartPoint
      ? this.secondaryStorage.read(Math.max(from, this.secondaryStorageStartPoint), to)
      : Promise.resolve([]);
    const [initialResults, secondaryResults] = await Promise.all([
      initialResultsPromise,
      secondaryResultsPromise,
    ]);

    return [...initialResults, ...secondaryResults];
  }

  async append(timestamp: number, value: ArrayBuffer): Promise<void> {
    if (timestamp >= this.secondaryStorageStartPoint) {
      await this.secondaryStorage.append(timestamp, value);
    } else {
      await this.initialStorage.append(timestamp, value);
    }
  }
}

// export async function initLifecycleController(
//   id: string,
//   configState$: BehaviorSubject<LifecycleControllerConfigEntry>,
// ): Promise<LifecycleControllerInternalState> {
//   const ageBehaviour$ = new BehaviorSubject(configState$.value.age);
//   configState$.pipe(map(state => state.age)).subscribe(ageBehaviour$);
//   const initialStorageBehaviour$ = new BehaviorSubject(configState$.value.initialStorage);
//   configState$.pipe(map(state => state.initialStorage)).subscribe(initialStorageBehaviour$);
//   const secondaryStorageBehaviour$ = new BehaviorSubject(configState$.value.secondaryStorage);
//   configState$.pipe(map(state => state.secondaryStorage)).subscribe(secondaryStorageBehaviour$);
//
//   return new LifecycleControllerInternalState(
//     id,
//     ageBehaviour$,
//     initialStorageBehaviour$,
//     secondaryStorageBehaviour$,
//   );
// }
//
// export async function append(
//   internalState: LifecycleControllerInternalState,
//   timestamp: number,
//   value: ArrayBuffer,
// ): Promise<void> {
//
// }
//
// export async function read(
//   internalState: LifecycleControllerInternalState,
//   from: number,
//   to: number,
// ): Promise<ArrayBuffer[]> {
//
// }
