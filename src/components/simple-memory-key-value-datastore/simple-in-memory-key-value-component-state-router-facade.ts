import {
  ComponentErrorState, ComponentInitializingState, ComponentReadyState,
  ComponentStateConfigRequestHandlerFacade,
  ComponentStateConfigRequestRouterContext, ComponentStateResponse
} from '../../facades/component-state-config-request-handler';
import { SimpleInMemoryKeyValueConfiguration } from './simple-in-memory-key-value-configuration';
import {
  ComponentStateConfigAddressedRequest
} from '../../routing/requests/config-addressed/component-state-config-addressed-request';
import { ComponentName } from '../scaffolding/component-name';

export const simpleInMemoryKeyValueComponentStateRouterFacade: ComponentStateConfigRequestHandlerFacade<SimpleInMemoryKeyValueConfiguration> = {
  async handleComponentStateConfigRequest(
    { metadataManager }: ComponentStateConfigRequestRouterContext,
    request: ComponentStateConfigAddressedRequest,
    config: SimpleInMemoryKeyValueConfiguration,
  ): Promise<ComponentStateResponse> {
    // Look up internal config
    const internalPath = [...request.target, 'internal'];
    const metadataDispatcher = await metadataManager.getClosestDispatcherMatching(internalPath);
    if (!metadataDispatcher) {
      return new ComponentErrorState(`Node does not have a MetadataDispatcher matching path: ${internalPath.join(', ')}`);
    }

    const internalConfig = await metadataDispatcher.getEntryAs(internalPath, ComponentName.SimpleMemoryKeyValueInternal);
    if (!internalConfig) {
      return new ComponentInitializingState('Creating internal configuration');
    }
    if (!internalConfig.remoteProcess) {
      return new ComponentInitializingState('Creating remote process');
    }

    return new ComponentReadyState();
  }
}
