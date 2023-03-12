import { BaseProcess } from '../../processes/base-process';
import { ProcessType } from '../../processes/process-type';
import { RpcInterface } from '../../rpc/rpc-interface';
import { FullyQualifiedPath } from '../../core/metadata-state/config';
import { AnyRequest } from '../../routing/requests/any-request';

export class MetadataTemporaryRouterProcess implements BaseProcess<ProcessType.MetadataTemporaryRouter> {
  public readonly type = ProcessType.MetadataTemporaryRouter;

  constructor() {}
}
