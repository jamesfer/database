import { Codec } from '../../types/codec';
import { NaiveRpcCommitLogRequest } from './naive-rpc-commit-log-request';

export class NaiveRpcCommitLogRequestCodec<T> implements Codec<NaiveRpcCommitLogRequest<T>, string> {
  constructor(private readonly codec: Codec<T, string>) {}

  async serialize(request: NaiveRpcCommitLogRequest<T>): Promise<string> {
    return JSON.stringify({
      nodeId: request.nodeId,
      path: request.path,
      value: await this.codec.serialize(request.value),
    });
  }

  async deserialize(serialized: string): Promise<NaiveRpcCommitLogRequest<T> | undefined> {
    const parsed = JSON.parse(serialized);
    if (!parsed.value || !parsed.nodeId || !parsed.path) {
      return;
    }

    const value = await this.codec.deserialize(parsed.value);
    if (!value) {
      return;
    }

    return { value, nodeId: parsed.nodeId, path: parsed.path };
  }
}
