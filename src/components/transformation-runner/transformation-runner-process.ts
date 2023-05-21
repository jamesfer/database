import { BaseProcess } from '../../processes/base-process';
import { ProcessType } from '../../processes/process-type';
import {
  TransformationRunnerProcessRequestHandler
} from '../../interfaces/transformation-runner-process-request-handler';
import {
  TransformationRunnerProcessAddressedRequest
} from '../../routing/requests/process-addressed/transformation-runner-process-addressed-request';
import { Response } from '../../routing/types/response';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import { Query } from './query-language/query';
import { RpcInterface } from '../../rpc/rpc-interface';
import { AnyRequest } from '../../routing/requests/any-request';
import { stringify } from 'fp-ts/Json';

export class TransformationRunnerProcess extends BaseProcess<ProcessType.TransformationRunner> {
  public readonly type = ProcessType.TransformationRunner;

  constructor() {
    super();
  }
}

export class TransformationRunnerComponentProcessRequestHandler
  implements TransformationRunnerProcessRequestHandler<TransformationRunnerProcess> {
  constructor(
    private readonly rpcInterface: RpcInterface<AnyRequest>,
  ) {}

  async handleTransformationRunnerProcessRequest(
    process: TransformationRunnerProcess,
    request: TransformationRunnerProcessAddressedRequest,
  ): Promise<Response> {

    return pipe(
      await Query.run(request.query, this.rpcInterface)(),
      E.fold(
        (error) => {
          throw error;
        },
        stringify,
      ),
    );
  }
}
