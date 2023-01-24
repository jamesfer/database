import { RpcInterface } from '../../rpc/rpc-interface';
import { AnyRequest } from '../../routing/unified-request-router';
import { RequestRouter } from '../../routing/types/request-router';
import { KeyValueProcessAction, KeyValueProcessRequest } from '../../routing/requests/key-value-node-request';
import { switchRouter } from '../../routing/utils/switch-router';
import { LogStructuredMergeProcess } from './log-structured-merge-process';

export const logStructuredMergeProcessRouter = (
  rpcInterface: RpcInterface<AnyRequest>,
) => (
  process: LogStructuredMergeProcess,
): RequestRouter<KeyValueProcessRequest> => switchRouter('action')<KeyValueProcessRequest>({
  [KeyValueProcessAction.Get]: 1,
  [KeyValueProcessAction.Put](request) {
    request.key;
    request.value;
  },
  [KeyValueProcessAction.Drop]: 3,
});
