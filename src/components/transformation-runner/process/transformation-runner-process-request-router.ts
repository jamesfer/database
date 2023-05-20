import { TransformationRunnerProcess } from './transformation-runner-process';
import { RequestRouter } from '../../../routing/types/request-router';
import {
  TransformationRunnerProcessAddressedRequest,
  TransformationRunnerProcessRequestAction,
} from '../../../routing/actions/process-addressed/transformation-runner-process-addressed-request';
import { switchRouter } from '../../../routing/utils/switch-router';
import { RpcInterface } from '../../../rpc/rpc-interface';
import { Query } from '../query-language/query';
import { pipe } from 'fp-ts/function';
import { default as E } from 'fp-ts/Either';
import { AnyRequestResponse } from '../../../routing/actions/any-request-response';
import { AnyResponse } from '../../../routing/actions/any-response';

export const transformationRunnerProcessRequestRouter = (
  rpcInterface: RpcInterface<AnyRequestResponse>,
) => (
  process: TransformationRunnerProcess,
): RequestRouter<TransformationRunnerProcessAddressedRequest, AnyResponse> => switchRouter('action')<TransformationRunnerProcessAddressedRequest, AnyResponse>({
  async [TransformationRunnerProcessRequestAction.RunQuery](request): Promise<any> {
    return pipe(
      await Query.run(request.query, rpcInterface)(),
      E.fold(
        (error) => {
          throw error;
        },
        (items) => {
          return JSON.stringify(items);
        },
      ),
    );
  },
});
