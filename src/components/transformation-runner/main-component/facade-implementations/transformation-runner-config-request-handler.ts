import {
  TransformationRunnerConfigRequestHandler, TransformationRunnerConfigRequestHandlerContext
} from '../../../../facades/transformation-runner-config-request-handler';
import { TransformationRunnerConfiguration } from '../transformation-runner-configuration';
import { assert } from '../../../../utils/assert';
import { ComponentName } from '../../../scaffolding/component-name';
import {
  TransformationRunnerConfigRequestAction
} from '../../../../routing/requests/config-addressed/transformation-runner-config-addressed-request';
import { assertNever } from '../../../../utils/assert-never';
import {
  TransformationRunnerProcessRequestAction,
  TransformationRunnerProcessRunQueryRequest
} from '../../../../routing/requests/process-addressed/transformation-runner-process-addressed-request';
import { RequestCategory } from '../../../../routing/types/request-category';
import {
  ProcessAddressedGroupName
} from '../../../../routing/requests/process-addressed/base-process-addressed-request';

export const transformationRunnerConfigRequestHandler: TransformationRunnerConfigRequestHandler<TransformationRunnerConfiguration> = {
  async handleTransformationRunnerProcessRequest(
    { metadataManager, rpcInterface },
    request,
    config,
  ){
    // Look up internal config
    const internalPath = [...request.target, 'internal'];
    const metadataDispatcher = await metadataManager.getClosestDispatcherMatching(internalPath);
    assert(metadataDispatcher, `Node does not have a MetadataDispatcher matching path: ${internalPath.join(', ')}`);

    const internalConfig = await metadataDispatcher.getEntryAs(internalPath, ComponentName.TransformationRunnerInternal);
    assert(internalConfig, 'TransformationRunner internal config does not exist');
    assert(internalConfig.remoteProcess, 'TransformationRunner remote process is not ready yet');

    switch (request.action) {
      case TransformationRunnerConfigRequestAction.RunQuery:
        const processRequest: TransformationRunnerProcessRunQueryRequest = {
          category: RequestCategory.ProcessAction,
          group: ProcessAddressedGroupName.TransformationRunner,
          action: TransformationRunnerProcessRequestAction.RunQuery,
          targetNodeId: internalConfig.remoteProcess.nodeId,
          targetProcessId: internalConfig.remoteProcess.processId,
          query: request.query,
        }
        return rpcInterface.makeRequest(processRequest);

      default:
        assertNever(request.action);
    }
  }
}
