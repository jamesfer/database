import { FullyQualifiedPath } from '../../config/config';
import { RpcInterface } from '../../rpc/rpc-interface';
import { AnyRequest } from '../../routing/unified-request-router';
import { BaseProcess } from '../../processes/base-process';
import { ProcessType } from '../../processes/process-type';

export class HashPartitionProcess implements BaseProcess<ProcessType.HashPartition> {
  public readonly type = ProcessType.HashPartition;

  constructor(
    public readonly rpcInterface: RpcInterface<AnyRequest>,
    public readonly parentPath: FullyQualifiedPath,
    public readonly partitionIndex: number,
  ) {}
}
