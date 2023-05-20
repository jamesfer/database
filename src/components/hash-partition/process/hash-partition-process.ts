import { FullyQualifiedPath } from '../../../core/metadata-state/config';
import { RpcInterface } from '../../../rpc/rpc-interface';
import { BaseProcess } from '../../../processes/base-process';
import { ProcessType } from '../../../processes/process-type';
import { AnyRequestResponse } from '../../../routing/actions/any-request-response';

export class HashPartitionProcess implements BaseProcess<ProcessType.HashPartition> {
  public readonly type = ProcessType.HashPartition;

  constructor(
    public readonly rpcInterface: RpcInterface<AnyRequestResponse>,
    public readonly parentPath: FullyQualifiedPath,
    public readonly partitionIndex: number,
  ) {}
}
