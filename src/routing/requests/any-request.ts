import { ProcessAddressedRequest } from './process-addressed/process-addressed-request';
import { MetadataTemporaryRequest } from './metadata-temporary/metadata-temporary-request';
import { Codec } from '../../types/codec';
import {
  ProcessControlRequest,
  ProcessControlRequestAction,
  SpawnProcessPayload
} from './process-control/process-control-request';
import {
  ConfigAddressedRequestHandler,
  ConfigAddressedRequest
} from './config-addressed/any-config-addressed-request';
import { RequestCategory } from '../types/request-category';
import { Response } from '../types/response';
import { MetadataManager } from '../../core/metadata-state/metadata-manager';

export type AnyRequest =
  | { name: 'ConfigAddressedRequest', body: ConfigAddressedRequest }
  // | ProcessAddressedRequest
  // | ProcessControlRequest
  // | MetadataTemporaryRequest;


export class AnyRequestCodec implements Codec<AnyRequest, string> {
  async serialize(value: AnyRequest): Promise<string> {
    return JSON.stringify(value);
  }

  async deserialize(serialized: string): Promise<AnyRequest | undefined> {
    return JSON.parse(serialized);
  }
}

export class AnyRequestRouter {
  private readonly configAddressedRequestHandler = new ConfigAddressedRequestHandler(
    this.metadataManager,
  );

  constructor(
    private readonly metadataManager: MetadataManager,
  ) {}

  async handleRequest(
    request: AnyRequest,
  ): Promise<Response> {
    switch (request.name) {
      case 'ConfigAddressedRequest':
        return this.configAddressedRequestHandler.handleConfigAddressedRequest(
          request.body,
        )
    }
  }
}
