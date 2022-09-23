import { RequestRouter } from '../../routing/types/request-router';
import { NaiveRpcCommitLogRequest } from './naive-rpc-commit-log-request';
import { NaiveRpcCommitLog } from './naive-rpc-commit-log';

export function makeNaiveRpcCommitLogRouter<T>(naiveRPCCommitLog: NaiveRpcCommitLog<T>): RequestRouter<NaiveRpcCommitLogRequest<T>> {
  return async (request) => {
    await naiveRPCCommitLog.processCommittedLog(request.path, request.value);
  };
}
