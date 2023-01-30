import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { ProcessManager } from '../process-manager';
import { reduceConfigEntriesToConfig } from './utils/reduce-config-entries-to-config';
import { RpcInterface } from '../../rpc/rpc-interface';
import { AnyRequest } from '../../routing/unified-request-router';
import { Config, ConfigFolder, FullyQualifiedPath } from './config';
import { dispatchConfigFolderChanges } from './utils/dispatch-config-folder-changes';
import { MetadataDispatcherInterface } from '../../types/metadata-dispatcher-interface';
import { DistributedCommitLogInterface } from '../../types/distributed-commit-log-interface';
import { allComponentDistributedOperator } from '../../operators/all-component-distributed-operator';
import { ComponentName } from '../../components/scaffolding/component-name';
import { AllComponentConfigurations } from '../../components/scaffolding/all-component-configurations';
import { Refine } from '../../types/refine';

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

/**
 * This class could be split in two, one that handles getting and setting data from the state and stores the current
 * config and another that handles dispatching changes to the state to component operators.
 */
export class MetadataDispatcher implements MetadataDispatcherInterface {
  static async initialize(
    nodeId: string,
    path: FullyQualifiedPath,
    processManager: ProcessManager,
    metadataCommitLog: DistributedCommitLogInterface<AllComponentConfigurations>,
    rpcInterface: RpcInterface<AnyRequest>,
    nodes$: Observable<string[]>,
  ): Promise<MetadataDispatcher> {
    return new MetadataDispatcher(nodeId, path, processManager, metadataCommitLog, rpcInterface, nodes$);
  }

  private readonly allSubscriptions = new Subscription();

  private readonly isLeader$ = new BehaviorSubject(false);

  private readonly currentConfig$ = new BehaviorSubject(Config.empty());

  private constructor(
    private readonly nodeId: string,
    private readonly path: FullyQualifiedPath,
    private readonly processManager: ProcessManager,
    private readonly metadataCommitLog: DistributedCommitLogInterface<AllComponentConfigurations>,
    private readonly rpcInterface: RpcInterface<AnyRequest>,
    private readonly nodes$: Observable<string[]>,
  ) {
    this.allSubscriptions.add(this.metadataCommitLog.isLeader$.subscribe(this.isLeader$));

    this.allSubscriptions.add(
      this.metadataCommitLog.commits$.pipe(
        reduceConfigEntriesToConfig,
      ).subscribe(this.currentConfig$),
    );

    // Subscribe to the config and start child processes
    this.allSubscriptions.add(
      this.currentConfig$.pipe(
        map(config => config.rootFolder),
        // TODO only select entries that this node is a leader of, or they are assigned with @nodeId
        // filterRelevantChanges(this.nodeId, this.isLeader$),
        // Only select changes if we are the leader
        onlyIncludeWhenLeading(this.isLeader$),
        dispatchConfigFolderChanges([], lifecycle => allComponentDistributedOperator(
          {
            nodeId: this.nodeId,
            nodes$: this.nodes$,
            processManager: this.processManager,
            rpcInterface: this.rpcInterface,
            metadataDispatcher: this,
          },
          lifecycle,
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
    // TODO check that the config parent is not a metadata group
    return configParent !== undefined;
  }

  ownsPath(path: FullyQualifiedPath): boolean {
    return this.isLeader$.getValue() && this.containsPath(path);
  }

  async getEntry(path: FullyQualifiedPath): Promise<AllComponentConfigurations | undefined> {
    return this.findEntry(path);
  }

  async getEntryAs<N extends ComponentName>(path: FullyQualifiedPath, name: N): Promise<Refine<AllComponentConfigurations, { NAME: N }>> {
    const entry = await this.getEntry(path);
    if (!entry) {
      throw new Error(`Could not find config entry at path: ${path.join('/')}, on node: ${this.nodeId}`);
    }

    if (entry.NAME !== name) {
      throw new Error(`Tried to get a config entry as the incorrect type. Config type: ${entry.NAME}, expected type: ${name}, node id: ${this.nodeId}`);
    }

    // We have to use a cast here because Typescript can't correctly infer the type with a generic parameter
    return entry as Refine<AllComponentConfigurations, { NAME: N }>;
  }

  async putEntry(path: FullyQualifiedPath, entry: AllComponentConfigurations): Promise<void> {
    return this.metadataCommitLog.write(path, entry);
  }

  async cleanup() {
    this.allSubscriptions.unsubscribe();
  }

  private findEntry(path: FullyQualifiedPath): AllComponentConfigurations | undefined {
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
