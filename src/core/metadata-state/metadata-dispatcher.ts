import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { ProcessManager } from '../process-manager';
import { BaseFacade, FACADES_KEY } from '../../facades/scaffolding/base-facade';
import { METADATA_DISPATCHER_FACADE_FLAG, MetadataDispatcherFacade } from '../../facades/metadata-dispatcher-facade';
import { DistributedMetadataFacade } from '../../facades/distributed-metadata-facade';
import { reduceConfigEntriesToConfig } from './utils/reduce-config-entries-to-config';
import { RPCInterface } from '../../types/rpc-interface';
import { AnyRequest } from '../../routing/all-request-router';
import { Config, ConfigFolder, FullyQualifiedPath } from '../../config/config';
import { ConfigEntryName } from '../../config/config-entry-name';
import { ConfigEntry, SelectConfigEntry } from '../../config/config-entry';
import { allComponentOperator } from '../../components/all-component-operator';
import { dispatchConfigFolderChanges } from './utils/dispatch-config-folder-changes';

const onlyIncludeWhenLeading = (
  isLeader$: Observable<boolean>,
) => (
  configFolder$: Observable<ConfigFolder>,
): Observable<ConfigFolder> => {
  return configFolder$.pipe(
    withLatestFrom(isLeader$),
    filter(([_, isLeader]) => isLeader),
    map(([folder]) => folder),
  );
}

export class MetadataDispatcher implements BaseFacade, MetadataDispatcherFacade {
  public readonly [FACADES_KEY]: MetadataDispatcherFacade[typeof FACADES_KEY] = {
    [METADATA_DISPATCHER_FACADE_FLAG]: this
  };

  static async initialize(
    nodeId: string,
    path: FullyQualifiedPath,
    processManager: ProcessManager,
    // nodeList$: Observable<string[]>,
    distributedMetadata: DistributedMetadataFacade,
    rpcInterface: RPCInterface<AnyRequest>,
    nodes$: Observable<string[]>,
  ): Promise<MetadataDispatcher> {
    // const server = await MetadataServer.initialize();
    return new MetadataDispatcher(nodeId, path, processManager, distributedMetadata, rpcInterface, nodes$);
  }

  private readonly allSubscriptions = new Subscription();

  private readonly isLeader$ = new BehaviorSubject(false);

  private readonly currentConfig$ = new BehaviorSubject(Config.empty());

  private constructor(
    private readonly nodeId: string,
    private readonly path: FullyQualifiedPath,
    private readonly processManager: ProcessManager,
    private readonly distributedMetadata: DistributedMetadataFacade,
    private readonly rpcInterface: RPCInterface<AnyRequest>,
    private readonly nodes$: Observable<string[]>,
    // private readonly server: MetadataServer,
    // private readonly isLeader: boolean,
  ) {
    this.allSubscriptions.add(this.distributedMetadata.isLeader$.subscribe(this.isLeader$));

    this.allSubscriptions.add(
      this.distributedMetadata.commits$.pipe(
        reduceConfigEntriesToConfig,
      ).subscribe(this.currentConfig$)
    );

    // Subscribe to the config and start child processes
    this.allSubscriptions.add(
      this.currentConfig$.pipe(
        map(config => config.rootFolder),
        // TODO only select entries that this node is a leader of, or they are assigned with @nodeId
        // filterRelevantChanges(this.nodeId, this.isLeader$),
        // Only select changes if we are the leader
        onlyIncludeWhenLeading(this.isLeader$),
        dispatchConfigFolderChanges([], allComponentOperator(
          this.nodeId,
          this.processManager,
          this,
          this.rpcInterface,
          this.nodes$,
        )),
      ).subscribe()
    );
  }

  containsPath(path: FullyQualifiedPath): boolean {
    const firstHalf = path.slice(0, this.path.length);
    if (firstHalf.join('/') !== this.path.join('/')) {
      return false;
    }

    const pathToDirectory = path.slice(this.path.length, -1);
    if (pathToDirectory.length === 0) {
      // The path points to an entry in the root directory
      return true;
    }

    const configParent = this.findEntry(pathToDirectory);
    return (configParent !== undefined && configParent.name !== ConfigEntryName.MetadataGroup);
  }

  ownsPath(path: FullyQualifiedPath): boolean {
    return this.isLeader$.getValue() && this.containsPath(path);
  }

  async getEntry(path: FullyQualifiedPath): Promise<ConfigEntry | undefined> {
    return this.findEntry(path);
  }

  async getEntryAs<N extends ConfigEntryName>(path: FullyQualifiedPath, name: N): Promise<SelectConfigEntry<N>> {
    const entry = await this.getEntry(path);
    if (!entry) {
      throw new Error(`Could not find config entry at path: ${path.join('/')}`)
    }

    if (entry.name !== name) {
      throw new Error(`Tried to get a config entry as the incorrect type. Config type: ${entry.name}, expected type: ${name}`);
    }

    // We have to use a cast here because Typescript can't correctly infer the type with a generic parameter
    return entry as SelectConfigEntry<N>;
  }

  async putEntry(path: FullyQualifiedPath, entry: ConfigEntry): Promise<void> {
    return this.distributedMetadata.write(path, entry);
  }

  async cleanup() {
    this.allSubscriptions.unsubscribe();
  }

  private findEntry(path: FullyQualifiedPath): ConfigEntry | undefined {
    const config = this.currentConfig$.getValue()
    let [nextPathSegment, ...remainingPath] = path;
    if (!nextPathSegment) {
      // The given path points to this exact metadata group
      return;
    }

    let configFolder = config.rootFolder;
    while (true) {
      const entry = configFolder.entries[nextPathSegment];
      if (!entry) {
        return;
      }

      [nextPathSegment, ...remainingPath] = remainingPath;
      if (!nextPathSegment) {
        // There is no more path yet, we've found the entry that we're looking for
        return entry.item;
      }

      configFolder = entry.children;
    }
  }
}
