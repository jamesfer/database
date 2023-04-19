import { Codec } from '../../types/codec';
import { ConfigAddressedResponse } from './config-addressed/config-addressed-response';

export type AnyResponse =
  | undefined
  | null
  | void
  | ConfigAddressedResponse;

export class AnyResponseCodec implements Codec<AnyResponse, string> {
  async serialize(value: AnyResponse): Promise<string> {
    return JSON.stringify(value);
  }

  async deserialize(serialized: string): Promise<AnyResponse | undefined> {
    return JSON.parse(serialized);
  }
}
