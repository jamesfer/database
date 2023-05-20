import { RowBlockConfigRequestHandlerFacade } from '../../../../facades/row-block-config-request-handler';
import { JsonLinesRowBlockConfiguration } from '../json-lines-row-block-configuration';
import { assert } from '../../../../utils/assert';
import { ComponentName } from '../../../scaffolding/component-name';
import {
  AppendRowBlockProcessAddressedRequest,
  RowBlockProcessAddressedRequestAction,
  ScanAllRowBlockProcessAddressedRequest
} from '../../../../routing/actions/process-addressed/row-block-process-addressed-request';
import { RequestCategory } from '../../../../routing/actions/request-category';
import {
  ProcessAddressedGroupName
} from '../../../../routing/actions/process-addressed/base-process-addressed-request';
import { assertNever } from '../../../../utils/assert-never';
import {
  RowBlockConfigAddressedRequestActionType
} from '../../../../routing/actions/config-addressed/row-block/request-action-type';

export const jsonLinesRowBlockConfigRequestHandler: RowBlockConfigRequestHandlerFacade<JsonLinesRowBlockConfiguration> = {
  async handleRowBlockConfigRequest({ metadataManager, rpcInterface }, request, config) {
    // Look up internal config
    const internalPath = [...request.target, 'internal'];
    const metadataDispatcher = await metadataManager.getClosestDispatcherMatching(internalPath);
    assert(metadataDispatcher, `Node does not have a MetadataDispatcher matching path: ${internalPath.join(', ')}`);

    const internalConfig = await metadataDispatcher.getEntryAs(internalPath, ComponentName.JsonLinesRowBlockInternal);
    assert(internalConfig, 'JsonLinesRowBlock internal config does not exist');
    assert(internalConfig.remoteProcess, 'JsonLinesRowBlock remote process is not ready yet');

    switch (request.action) {
      case RowBlockConfigAddressedRequestActionType.ScanAll: {
        const processRequest: ScanAllRowBlockProcessAddressedRequest = {
          category: RequestCategory.Process,
          group: ProcessAddressedGroupName.RowBlock,
          action: RowBlockProcessAddressedRequestAction.ScanAll,
          targetNodeId: internalConfig.remoteProcess.nodeId,
          targetProcessId: internalConfig.remoteProcess.processId,
        }
        return rpcInterface.makeRequest(processRequest);
      }
      case RowBlockConfigAddressedRequestActionType.Append: {
        const processRequest: AppendRowBlockProcessAddressedRequest = {
          category: RequestCategory.Process,
          group: ProcessAddressedGroupName.RowBlock,
          action: RowBlockProcessAddressedRequestAction.Append,
          targetNodeId: internalConfig.remoteProcess.nodeId,
          targetProcessId: internalConfig.remoteProcess.processId,
          rows: request.rows,
        }
        return rpcInterface.makeRequest(processRequest);
      }
      default:
        return assertNever(request);
    }
  }
}
