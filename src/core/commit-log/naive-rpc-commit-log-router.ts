import { RequestRouter } from '../../routing/types/request-router';
import { NaiveRpcCommitLogRequest } from './naive-rpc-commit-log-request';
import { InternalNaiveRpcCommitLog } from './internal-naive-rpc-commit-log';

export function makeNaiveRpcCommitLogRouter<T>(
  naiveRPCCommitLog: InternalNaiveRpcCommitLog<T>,
): RequestRouter<NaiveRpcCommitLogRequest<T>> {
  return async (request) => {
    await naiveRPCCommitLog.processCommittedLog(request.path, request.value);
  };
}
