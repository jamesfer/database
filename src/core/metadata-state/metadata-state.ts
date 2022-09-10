import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { scan } from 'rxjs/operators';
import {
  Config,
  ConfigFolder,
  ConfigFolderItem,
  FullyQualifiedPath
} from '../../config/config';
import { ConfigEntry } from '../../config/config-entry';

/**
 * Publishes changes to the config state and consumes updates from gossip.
 */
export class MetadataState {
  private readonly events$: Subject<ConfigEntry> = new Subject<ConfigEntry>();

  private readonly coldInternalConfig$: Observable<Config> = this.events$.pipe(
    scan(MetadataState.updateConfig, Config.empty()),
  );

  private readonly internalConfigBehaviourSubject$: BehaviorSubject<Config>
    = new BehaviorSubject<Config>(Config.empty());

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

  // configEntryAt(path: FullyQualifiedPath): ConfigEntry | undefined {
  //   return this.internalConfigBehaviourSubject$.value.entries[path.join('/')];
  // }

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
    const [nextPathSegment, ...remainingPath] = newEntry.id;
    if (!nextPathSegment) {
      throw new Error('Cannot update the root entry of the config');
    }

    return new Config(MetadataState.updateConfigFolder(
      existingConfig.rootFolder,
      nextPathSegment,
      remainingPath,
      newEntry,
    ));
  }

  private static updateConfigFolder(
    existingFolder: ConfigFolder,
    pathSegment: string,
    remainingPath: FullyQualifiedPath,
    newEntry: ConfigEntry,
  ): ConfigFolder {
    return new ConfigFolder({
      ...existingFolder.entries,
      [pathSegment]: this.updateConfigFolderItem(existingFolder.entries[pathSegment], remainingPath, newEntry),
    })
  }

  private static updateConfigFolderItem(
    existingFolderItem: ConfigFolderItem | undefined,
    path: FullyQualifiedPath,
    newEntry: ConfigEntry,
  ): ConfigFolderItem {
    const [nextPathSegment, ...remainingPath] = path;

    if (!existingFolderItem) {
      if (nextPathSegment) {
        throw new Error('Cannot create a config entry inside a folder that does not exist');
      }

      return new ConfigFolderItem(newEntry, new ConfigFolder({}));
    }

    if (nextPathSegment) {
      return new ConfigFolderItem(
        existingFolderItem.item,
        this.updateConfigFolder(
          existingFolderItem.children,
          nextPathSegment,
          remainingPath,
          newEntry,
        ),
      );
    }

    return new ConfigFolderItem(
      newEntry,
      existingFolderItem.children,
    );
  }
}
