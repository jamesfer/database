import {
  TransformationRunnerConfigAddressedRequest,
  TransformationRunnerConfigAddressedRequestHandler
} from './transformation-runner-config-addressed-request';
import { Response } from '../../types/response';
import { MetadataManager } from '../../../core/metadata-state/metadata-manager';
import { FullyQualifiedPath } from '../../../core/metadata-state/config';
import { assert } from '../../../utils/assert';
import { assertNever } from '../../../utils/assert-never';

export type AnyConfigAddressedRequestBody =
  // | KeyValueConfigAddressedRequest
  | { name: 'TransformationRunnerConfigAddressedRequest', request: TransformationRunnerConfigAddressedRequest }
  // | ComponentStateConfigAddressedRequest;

export interface ConfigAddressedRequest {
  target: FullyQualifiedPath;
  body: AnyConfigAddressedRequestBody;
}

export class ConfigAddressedRequestHandler {
  private readonly transformationRunnerRequestHandler = new TransformationRunnerConfigAddressedRequestHandler();

  constructor(
    private readonly metadataManager: MetadataManager,
  ) {}

  async handleConfigAddressedRequest(request: ConfigAddressedRequest): Promise<Response> {
    // Find the metadata dispatcher
    const metadataDispatcher = this.metadataManager.getClosestDispatcherMatching(request.target);
    assert(
      !!metadataDispatcher,
      `Node does not have a MetadataDispatcher matching path: ${request.target.join(', ')}`,
    );

    // Load the config entry
    const config = await metadataDispatcher.getEntry(request.target);
    assert(
      !!config,
      `Config does not exist at path: ${request.target}`,
    );

    // Call the right child router
    switch (request.body.name) {
      case 'TransformationRunnerConfigAddressedRequest':
        return this.transformationRunnerRequestHandler.handleTransformationRunnerConfigAddressedRequest(
          config,
          request.body.request,
        );

      default:
        assertNever(request.body.name);
    }
  }
}
