import { switchRouter } from '../../routing/utils/switch-router';
import { KeyValueProcessAction, KeyValueProcessAddressedRequest } from '../../routing/actions/process-addressed/key-value-process-addressed-request';
import { SimpleInMemoryKeyValueProcess } from './simple-in-memory-key-value-process';
import { RequestRouter } from '../../routing/types/request-router';
import { AnyResponse } from '../../routing/actions/any-response';

export const simpleInMemoryKeyValueProcessRouter = (
  process: SimpleInMemoryKeyValueProcess,
): RequestRouter<KeyValueProcessAddressedRequest, AnyResponse> => switchRouter('action')<KeyValueProcessAddressedRequest, AnyResponse>({
  async [KeyValueProcessAction.Get](request) {
    return process.get(request.key);
  },
  async [KeyValueProcessAction.Put](request) {
    await process.put(request.key, request.value);
  },
  async [KeyValueProcessAction.Drop](request) {
    await process.drop(request.key);
  }
})
