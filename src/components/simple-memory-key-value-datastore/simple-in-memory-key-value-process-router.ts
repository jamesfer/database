import { switchRouter } from '../../routing/utils/switch-router';
import { KeyValueProcessAction, KeyValueProcessAddressedRequest } from '../../routing/requests/process-addressed/key-value-process-addressed-request';
import { SimpleInMemoryKeyValueProcess } from './simple-in-memory-key-value-process';
import { RequestRouter } from '../../routing/types/request-router';

export const simpleInMemoryKeyValueProcessRouter = (
  process: SimpleInMemoryKeyValueProcess,
): RequestRouter<KeyValueProcessAddressedRequest> => switchRouter('action')<KeyValueProcessAddressedRequest>({
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
