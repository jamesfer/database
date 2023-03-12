import { TransformationRunnerProcess } from './transformation-runner-process';
import { RequestRouter } from '../../../routing/types/request-router';
import {
  TransformationRunnerProcessAddressedRequest,
  TransformationRunnerProcessRequestAction,
  TransformationRunnerProcessRunQueryRequest
} from '../../../routing/requests/process-addressed/transformation-runner-process-addressed-request';
import { switchRouter } from '../../../routing/utils/switch-router';
import { RpcInterface } from '../../../rpc/rpc-interface';
import { MetadataManager } from '../../../core/metadata-state/metadata-manager';
import { Query } from '../query-language/query';
import { pipe } from 'fp-ts/function';
import { default as E } from 'fp-ts/Either';
import { AnyRequest } from '../../../routing/requests/any-request';

export const transformationRunnerProcessRequestRouter = (
  rpcInterface: RpcInterface<AnyRequest>,
) => (
  process: TransformationRunnerProcess,
): RequestRouter<TransformationRunnerProcessAddressedRequest> => switchRouter('action')<TransformationRunnerProcessAddressedRequest>({
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
