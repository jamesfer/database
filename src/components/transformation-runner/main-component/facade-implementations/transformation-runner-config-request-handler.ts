import {
  TransformationRunnerConfigRequestHandler, TransformationRunnerConfigRequestHandlerContext
} from '../../../../facades/transformation-runner-config-request-handler';
import { TransformationRunnerConfiguration } from '../transformation-runner-configuration';
import { assert } from '../../../../utils/assert';
import { ComponentName } from '../../../scaffolding/component-name';
import { assertNever } from '../../../../utils/assert-never';
import {
  TransformationRunnerProcessRequestAction,
  TransformationRunnerProcessRunQueryRequest
} from '../../../../routing/actions/process-addressed/transformation-runner-process-addressed-request';
import { RequestCategory } from '../../../../routing/actions/request-category';
import {
  ProcessAddressedGroupName
} from '../../../../routing/actions/process-addressed/base-process-addressed-request';
import {
  TransformationRunnerConfigRequestActionType
} from '../../../../routing/actions/config-addressed/transformation-runner/request-action-type';

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
      case TransformationRunnerConfigRequestActionType.RunQuery:
        const processRequest: TransformationRunnerProcessRunQueryRequest = {
          category: RequestCategory.Process,
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
