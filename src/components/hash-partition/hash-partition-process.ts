import { BaseFacade, FACADES_KEY, PickFacades } from '../../facades/scaffolding/base-facade';
import { KEY_VALUE_PROCESS_ROUTER_FLAG } from '../../facades/key-value-process-router';
import { FullyQualifiedPath } from '../../config/config';
import { hashPartitionProcessRouter } from './hash-partition-process-router';
import { MetadataDispatcherFacade } from '../../facades/metadata-dispatcher-facade';
import { RPCInterface } from '../../types/rpc-interface';
import { AnyRequest } from '../../routing/all-request-router';

export class HashPartitionProcess implements BaseFacade {
  readonly [FACADES_KEY]: PickFacades<KEY_VALUE_PROCESS_ROUTER_FLAG> = {
    [KEY_VALUE_PROCESS_ROUTER_FLAG]: hashPartitionProcessRouter(this.rpcInterface, this),
  }

  static async initialize(
    rpcInterface: RPCInterface<AnyRequest>,
    parentPath: FullyQualifiedPath,
    partitionIndex: number,
  ): Promise<HashPartitionProcess> {
    return new HashPartitionProcess(rpcInterface, parentPath, partitionIndex);
  }

  private constructor(
    public readonly rpcInterface: RPCInterface<AnyRequest>,
    public readonly parentPath: FullyQualifiedPath,
    public readonly partitionIndex: number,
  ) {}
}
