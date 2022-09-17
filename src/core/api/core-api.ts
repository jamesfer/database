import { ProcessManager } from '../process-manager';
import { MetadataDispatcher } from '../metadata-state/metadata-dispatcher';
import { METADATA_DISPATCHER_FACADE_FLAG } from '../../facades/metadata-dispatcher-facade';
import { uniqueId } from 'lodash';
import { DistributedMetadataFactory } from '../../types/distributed-metadata-factory';
import { RPCInterface } from '../../types/rpc-interface';
import { AnyRequest } from '../../routing/all-request-router';
import { Observable } from 'rxjs';
import { FullyQualifiedPath } from '../../config/config';
import { ConfigEntry } from '../../config/config-entry';

export class CoreApi {
  public static async initialize(
    nodeId: string,
    processManager: ProcessManager,
    // metadataManager: MetadataManager,
    distributedMetadataFactory: DistributedMetadataFactory,
    rpcInterface: RPCInterface<AnyRequest>,
    nodes$: Observable<string[]>,
  ): Promise<CoreApi> {
    return new CoreApi(nodeId, processManager, distributedMetadataFactory, rpcInterface, nodes$);
  }

  private constructor(
    private readonly nodeId: string,
    private readonly processManager: ProcessManager,
    private readonly distributedMetadataFactory: DistributedMetadataFactory,
    private readonly rpcInterface: RPCInterface<AnyRequest>,
    private readonly nodes$: Observable<string[]>,
    // private readonly metadataManager: MetadataManager,
  ) {}

  // public async bootstrapMetadataCluster(): Promise<string> {
  //   const path: FullyQualifiedPath = [];
  //   const distributedMetadata = await this.distributedMetadataFactory.createDistributedMetadata(this.nodeId)
  //   const metadataDispatcher = await MetadataDispatcher.initialize(
  //     path,
  //     this.processManager,
  //     distributedMetadata,
  //   );
  //
  //   const dispatcherProcessId = uniqueId('metadataClusterLeader');
  //   this.processManager.register(dispatcherProcessId, metadataDispatcher);
  //
  //   return dispatcherProcessId;
  // }

  public async joinMetadataCluster(path: FullyQualifiedPath): Promise<string> {
    const distributedMetadata = await this.distributedMetadataFactory.createDistributedMetadata(this.nodeId);
    const metadataDispatcher = await MetadataDispatcher.initialize(
      this.nodeId,
      path,
      this.processManager,
      distributedMetadata,
      this.rpcInterface,
      this.nodes$,
    );
    const dispatcherProcessId = uniqueId('metadataClusterMember');
    this.processManager.register(dispatcherProcessId, metadataDispatcher);
    return dispatcherProcessId;
  }

  public async getEntry(path: FullyQualifiedPath): Promise<ConfigEntry | undefined> {
    // Find the matching metadata dispatcher
    const dispatchers = this.processManager.getAllProcessesByFlag(METADATA_DISPATCHER_FACADE_FLAG);
    const parentDispatcher = dispatchers.find(dispatcher => dispatcher.containsPath(path));
    if (!parentDispatcher) {
      throw new Error(`Could not find parent dispatcher for entry at ${path.join('/')}`);
    }

    return parentDispatcher.getEntry(path);
  }

  public async putEntry(path: FullyQualifiedPath, entry: ConfigEntry): Promise<void> {
    // Find the matching metadata dispatcher
    const dispatchers = this.processManager.getAllProcessesByFlag(METADATA_DISPATCHER_FACADE_FLAG);
    const parentDispatcher = dispatchers.find(dispatcher => dispatcher.ownsPath(path));
    if (!parentDispatcher) {
      throw new Error(`Could not find parent dispatcher for entry at ${path.join('/')}`);
    }

    await parentDispatcher.putEntry(path, entry);
  }
}
