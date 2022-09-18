import { switchRouter } from '../../routing/utils/switch-router';
import { KeyValueProcessAction, KeyValueProcessRequest } from '../../routing/requests/key-value-node-request';
import { SimpleMemoryKeyValueProcess } from './simple-memory-key-value-process';
import { KeyValueProcessRouter } from '../../facades/key-value-process-router';

export const simpleMemoryKeyValueProcessRouter = (
  process: SimpleMemoryKeyValueProcess,
): KeyValueProcessRouter => switchRouter('action')<KeyValueProcessRequest>({
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
