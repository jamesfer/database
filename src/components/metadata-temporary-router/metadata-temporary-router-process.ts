import { BaseProcess } from '../../processes/base-process';
import { ProcessType } from '../../processes/process-type';
import { RpcInterface } from '../../rpc/rpc-interface';
import { AnyRequest } from '../../routing/unified-request-router';
import { FullyQualifiedPath } from '../../config/config';

export class MetadataTemporaryRouterProcess implements BaseProcess<ProcessType.MetadataTemporaryRouter> {
  public readonly type = ProcessType.MetadataTemporaryRouter;

  constructor() {}
}
