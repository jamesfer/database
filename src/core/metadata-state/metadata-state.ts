import { ConnectableObservable, Observable, Subject, Subscription } from 'rxjs';
import { publishBehavior, scan } from 'rxjs/operators';
import { Config, ConfigEntry } from '../../types/config';

/**
 * Publishes changes to the config state and consumes updates from gossip.
 */
export class MetadataState {
  private readonly events$: Subject<ConfigEntry> = new Subject<ConfigEntry>();

  private readonly coldInternalConfig$: Observable<Config> = this.events$.pipe(
    scan(MetadataState.updateConfig, new Config({})),
  );

  private readonly hotInternalConfig$: ConnectableObservable<Config> = publishBehavior<Config>(
    new Config({}),
  )(
    this.coldInternalConfig$,
  );

  private hotConfigSubscription: undefined | Subscription;

  start(): () => void {
    const hotSubscription = this.hotConfigSubscription ?? this.hotInternalConfig$.connect();
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
  
  get config$(): Observable<Config> {
    return this.hotInternalConfig$;
  }

  private static updateConfig(existingConfig: Config, newEntry: ConfigEntry): Config {
    return new Config({
      ...existingConfig.entries,
      [newEntry.id.join('/')]: newEntry,
    });
  }
}
