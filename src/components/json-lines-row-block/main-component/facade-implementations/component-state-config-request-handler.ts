import {
  ComponentErrorState, ComponentInitializingState, ComponentReadyState,
  ComponentStateConfigRequestHandlerFacade
} from '../../../../facades/component-state-config-request-handler';
import { JsonLinesRowBlockConfiguration } from '../json-lines-row-block-configuration';
import { ComponentName } from '../../../scaffolding/component-name';

export const jsonLinesRowBlockComponentStateRouterFacade: ComponentStateConfigRequestHandlerFacade<JsonLinesRowBlockConfiguration> = {
  async handleComponentStateConfigRequest(
    { metadataManager },
    request,
    config,
  ) {
    // Look up internal config
    const internalPath = [...request.target, 'internal'];
    const metadataDispatcher = await metadataManager.getClosestDispatcherMatching(internalPath);
    if (!metadataDispatcher) {
      return new ComponentErrorState(`Node does not have a MetadataDispatcher matching path: ${internalPath.join(', ')}`);
    }

    const internalConfig = await metadataDispatcher.getEntryAs(internalPath, ComponentName.JsonLinesRowBlockInternal);
    if (!internalConfig) {
      return new ComponentInitializingState('Creating internal configuration');
    }
    if (!internalConfig.remoteProcess) {
      return new ComponentInitializingState('Creating remote process');
    }

    return new ComponentReadyState();
  }
}
