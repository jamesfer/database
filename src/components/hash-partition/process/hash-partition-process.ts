import { FullyQualifiedPath } from '../../../core/metadata-state/config';
import { RpcInterface } from '../../../rpc/rpc-interface';
import { BaseProcess } from '../../../processes/base-process';
import { ProcessType } from '../../../processes/process-type';
import { AnyRequest } from '../../../routing/requests/any-request';

export class HashPartitionProcess implements BaseProcess<ProcessType.HashPartition> {
  public readonly type = ProcessType.HashPartition;

  constructor(
    public readonly rpcInterface: RpcInterface<AnyRequest>,
    public readonly parentPath: FullyQualifiedPath,
    public readonly partitionIndex: number,
  ) {}
}
