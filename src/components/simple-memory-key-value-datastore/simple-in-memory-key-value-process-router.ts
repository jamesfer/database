import { switchRouter } from '../../routing/utils/switch-router';
import { KeyValueProcessAction, KeyValueProcessRequest } from '../../routing/requests/key-value-node-request';
import { SimpleInMemoryKeyValueProcess } from './simple-in-memory-key-value-process';
import { RequestRouter } from '../../routing/types/request-router';

export const simpleInMemoryKeyValueProcessRouter = (
  process: SimpleInMemoryKeyValueProcess,
): RequestRouter<KeyValueProcessRequest> => switchRouter('action')<KeyValueProcessRequest>({
  async [KeyValueProcessAction.Get](request) {
    // console.log('Received key value process get request', request, process);
    return process.get(request.key);
  },
  async [KeyValueProcessAction.Put](request) {
    await process.put(request.key, request.value);
    // console.log('Received key value process put request', request, process);
  },
  async [KeyValueProcessAction.Drop](request) {
    await process.drop(request.key);
  }
})
