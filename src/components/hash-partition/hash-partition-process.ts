import { BaseFacade, FACADES_KEY, PickFacades } from '../../facades/scaffolding/base-facade';
import { KEY_VALUE_PROCESS_ROUTER_FLAG } from '../../facades/key-value-process-router';
import { FullyQualifiedPath } from '../../config/config';
import { RPCInterface } from '../../types/rpc-interface';
import { AnyRequest } from '../../routing/all-request-router';
import { BaseProcess } from '../../processes/base-process';
import { ProcessType } from '../../processes/process-type';

export class HashPartitionProcess implements BaseProcess<ProcessType.HashPartition> {
  // readonly [FACADES_KEY]: PickFacades<KEY_VALUE_PROCESS_ROUTER_FLAG> = {
  //   [KEY_VALUE_PROCESS_ROUTER_FLAG]: hashPartitionProcessRouter(this.rpcInterface, this),
  // }

  // static async initialize(
  //   rpcInterface: RPCInterface<AnyRequest>,
  //   parentPath: FullyQualifiedPath,
  //   partitionIndex: number,
  // ): Promise<HashPartitionProcess> {
  //   return new HashPartitionProcess(rpcInterface, parentPath, partitionIndex);
  // }

  public readonly type = ProcessType.HashPartition;

  constructor(
    public readonly rpcInterface: RPCInterface<AnyRequest>,
    public readonly parentPath: FullyQualifiedPath,
    public readonly partitionIndex: number,
  ) {}
}
