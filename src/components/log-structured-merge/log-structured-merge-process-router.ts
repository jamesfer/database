import { RpcInterface } from '../../rpc/rpc-interface';
import { RequestRouter } from '../../routing/types/request-router';
import { KeyValueProcessAction, KeyValueProcessAddressedRequest } from '../../routing/actions/process-addressed/key-value-process-addressed-request';
import { switchRouter } from '../../routing/utils/switch-router';
import { LogStructuredMergeProcess } from './log-structured-merge-process';
import { AnyRequestResponse } from '../../routing/actions/any-request-response';

export const logStructuredMergeProcessRouter = (
  rpcInterface: RpcInterface<AnyRequestResponse>,
) => (
  process: LogStructuredMergeProcess,
): RequestRouter<KeyValueProcessAddressedRequest> => switchRouter('action')<KeyValueProcessAddressedRequest>({
  [KeyValueProcessAction.Get]: 1,
  [KeyValueProcessAction.Put](request) {
    request.key;
    request.value;
  },
  [KeyValueProcessAction.Drop]: 3,
});
