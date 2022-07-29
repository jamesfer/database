import { BehaviorSubject, ConnectableObservable, Observable, Subject, Subscription } from 'rxjs';
import { publishBehavior, scan } from 'rxjs/operators';
import { Config, ConfigEntry, FullyQualifiedPath } from '../../types/config';

/**
 * Publishes changes to the config state and consumes updates from gossip.
 */
export class MetadataState {
  private readonly events$: Subject<ConfigEntry> = new Subject<ConfigEntry>();

  private readonly coldInternalConfig$: Observable<Config> = this.events$.pipe(
    scan(MetadataState.updateConfig, new Config({})),
  );

  private readonly internalConfigBehaviourSubject$: BehaviorSubject<Config>
    = new BehaviorSubject<Config>(new Config({}));

  // private readonly hotInternalConfig$: ConnectableObservable<Config> =
  //   publish(this.internalConfigBehaviourSubject$)(this.coldInternalConfig$)

  //   publishBehavior<Config>(
  //   new Config({}),
  // )(
  //   this.coldInternalConfig$,
  // );

  private hotConfigSubscription: undefined | Subscription;

  get config$(): Observable<Config> {
    return this.internalConfigBehaviourSubject$.asObservable();
  }

  get currentConfig(): Config {
    return this.internalConfigBehaviourSubject$.value;
  }

  configEntryAt(path: FullyQualifiedPath): ConfigEntry | undefined {
    return this.internalConfigBehaviourSubject$.value.entries[path.join('/')];
  }

  start(): () => void {
    const hotSubscription = this.hotConfigSubscription
      ?? this.coldInternalConfig$.subscribe(this.internalConfigBehaviourSubject$);
    this.hotConfigSubscription = hotSubscription;
    return () => {
      if (!hotSubscription.closed) {
        hotSubscription.unsubscribe();
      }
    };
  }

  publish(event: ConfigEntry) {
    this.events$.next(event);
  }

  private static updateConfig(existingConfig: Config, newEntry: ConfigEntry): Config {
    return new Config({
      ...existingConfig.entries,
      [newEntry.id.join('/')]: newEntry,
    });
  }
}
