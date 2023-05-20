import { ConfigAddressedRequest } from './config-addressed/config-addressed-request';
import { ProcessAddressedRequest } from './process-addressed/process-addressed-request';
import { MetadataTemporaryRequest } from './metadata-temporary/metadata-temporary-request';
import { Codec } from '../../types/codec';
import { ProcessControlRequest } from './process-control/process-control-request';

export type AnyRequestResponse =
  | ConfigAddressedRequest
  | ProcessAddressedRequest
  | ProcessControlRequest
  | MetadataTemporaryRequest;

// export class AnyRequestCodec implements Codec<AnyRequest, string> {
//   async serialize(value: AnyRequest): Promise<string> {
//     return JSON.stringify(value);
//   }
//
//   async deserialize(serialized: string): Promise<AnyRequest | undefined> {
//     return JSON.parse(serialized);
//   }
// }
