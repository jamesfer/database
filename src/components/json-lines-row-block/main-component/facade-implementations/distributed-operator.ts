import {
  DistributedOperatorFacade
} from '../../../../facades/distributed-operator-facade';
import { Observable } from 'rxjs';
import { concatMap, withLatestFrom } from 'rxjs/operators';
import { AllComponentConfigurations } from '../../../scaffolding/all-component-configurations';
import { ComponentName } from '../../../scaffolding/component-name';
import { sample } from 'lodash';
import {
  ProcessControlRequestAction,
  SpawnProcessRequest
} from '../../../../routing/actions/process-control/process-control-request';
import { RequestCategory } from '../../../../routing/actions/request-category';
import { assert } from '../../../../utils/assert';
import { JsonLinesRowBlockConfiguration } from '../json-lines-row-block-configuration';
import {
  JsonLinesRowBlockInternalConfiguration
} from '../../internal-component/json-lines-row-block-internal-configuration';

export const JsonLinesDistributedOperatorFacade: DistributedOperatorFacade<JsonLinesRowBlockConfiguration> = {
  distributedOperatorFunction(
    { nodes$, metadataDispatcher, rpcInterface },
    { events$, path },
  ): Observable<void> {
    return events$.pipe(
      withLatestFrom(nodes$),
      concatMap(async ([config, nodes]) => {
        // Fetch the internal config
        const internalConfigPath = [...path, 'internal'];
        let internalConfig: AllComponentConfigurations | undefined = await metadataDispatcher.getEntry(internalConfigPath);

        // Create it, if it doesn't exist
        if (!internalConfig) {
          internalConfig = new JsonLinesRowBlockInternalConfiguration(undefined);
          await metadataDispatcher.putEntry(internalConfigPath, internalConfig);
        }

        // Throw an error if it has the wrong type
        if (internalConfig.NAME !== ComponentName.JsonLinesRowBlockInternal) {
          throw new Error('JsonLinesRowBlock has the wrong internal config type');
        }

        // Spawn the remote process
        if (!internalConfig.remoteProcess) {
          // Pick a node
          const chosenNode: string | undefined = sample(nodes);
          assert(chosenNode, 'No nodes available to allocate a JsonLinesRowBlock process to');

          // Send a spawn process request
          const spawnProcessRequest: SpawnProcessRequest = {
            category: RequestCategory.ProcessControl,
            action: ProcessControlRequestAction.Spawn,
            targetNodeId: chosenNode,
            payload: { processClass: 'JsonLinesRowBlock' },
          }
          const newProcessId = await rpcInterface.makeRequest(spawnProcessRequest);
          assert(typeof newProcessId === 'string', `Received invalid response from spawn processes request. Expected: string, received: ${newProcessId}`);

          internalConfig = new JsonLinesRowBlockInternalConfiguration({ nodeId: chosenNode, processId: newProcessId });
          await metadataDispatcher.putEntry(internalConfigPath, internalConfig);
        }
      }),
    );
  }
}
