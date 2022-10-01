import { Codec } from '../types/codec';
import { AnyRequest } from './all-request-router';

export class AnyRequestCodec implements Codec<AnyRequest, string> {
  async serialize(value: AnyRequest): Promise<string> {
    return JSON.stringify(value);
  }

  async deserialize(serialized: string): Promise<AnyRequest | undefined> {
    return JSON.parse(serialized);
  }
}
