import { Observable } from 'rxjs';
import { concatMap, withLatestFrom } from 'rxjs/operators';
import { Equals } from '../../interfaces/equals';
import { Serializable } from '../../interfaces/serializable';
import { DistributedOperator } from '../../interfaces/distributed-operator';
import {
  TransformationRunnerInternalConfiguration
} from './internal-component/transformation-runner-internal-configuration';
import { ComponentName } from '../scaffolding/component-name';
import { sample } from 'lodash';
import { assert } from '../../utils/assert';
import {
  ProcessControlRequestAction,
  SpawnProcessRequest
} from '../../routing/requests/process-control/process-control-request';
import { RequestCategory } from '../../routing/types/request-category';
import {
  TransformationRunnerConfigRequestHandler
} from '../../interfaces/transformation-runner-config-request-handler';
import {
  TransformationRunnerConfigAddressedRequest, TransformationRunnerConfigRequestAction
} from '../../routing/requests/config-addressed/transformation-runner-config-addressed-request';
import { Response } from '../../routing/types/response';
import {
  TransformationRunnerProcessRequestAction,
  TransformationRunnerProcessRunQueryRequest
} from '../../routing/requests/process-addressed/transformation-runner-process-addressed-request';
import { ProcessAddressedGroupName } from '../../routing/requests/process-addressed/base-process-addressed-request';
import { assertNever } from '../../utils/assert-never';
import { Json } from 'fp-ts/Json';
import { FullyQualifiedPath } from '../../core/metadata-state/config';
import { RpcInterface } from '../../rpc/rpc-interface';
import { AnyRequest } from '../../routing/requests/any-request';
import { MetadataManager } from '../../core/metadata-state/metadata-manager';
import { MetadataDispatcherInterface } from '../../types/metadata-dispatcher-interface';

export interface TransformationRunnerConfiguration {}

export type TransformationRunnerImplementations =
  & Equals<TransformationRunnerConfiguration>
  & Serializable<TransformationRunnerConfiguration>

export const TransformationRunnerImplementations: TransformationRunnerImplementations = {
  equals(left, right): boolean {
    return true;
  },
  serialize(object): Json {
    return '';
  },
  deserialize(encoded): TransformationRunnerConfiguration {
    return {};
  },
};

export class TransformationRunnerComponentConfigRequestHandler
implements TransformationRunnerConfigRequestHandler<TransformationRunnerConfiguration> {
  constructor(
    private readonly rpcInterface: RpcInterface<AnyRequest>,
    private readonly metadataManager: MetadataManager,
  ) {}

  async handleTransformationRunnerConfigRequest(
    config: TransformationRunnerConfiguration,
    request: TransformationRunnerConfigAddressedRequest,
  ): Promise<Response> {
    // Look up internal config
    const internalPath = [...request.target, 'internal'];
    const metadataDispatcher = await this.metadataManager.getClosestDispatcherMatching(internalPath);
    assert(metadataDispatcher, `Node does not have a MetadataDispatcher matching path: ${internalPath.join(', ')}`);

    const { configuration: internalConfig } = await metadataDispatcher.getEntryAs(
      internalPath,
      'InternalTransformationRunnerConfiguration',
    );
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
        return this.rpcInterface.makeRequest(processRequest);

      default:
        assertNever(request.action);
    }
  }
}


export class TransformationRunnerOperator
implements DistributedOperator<TransformationRunnerConfiguration> {
  constructor(
    private readonly nodes$: Observable<string[]>,
    private readonly metadataDispatcher: MetadataDispatcherInterface,
    private readonly rpcInterface: RpcInterface<AnyRequest>,
  ) {}

  distributedOperator(
    path: FullyQualifiedPath,
    events$: Observable<TransformationRunnerConfiguration>,
  ): Observable<void> {
    return events$.pipe(
      withLatestFrom(this.nodes$),
      concatMap(async ([config, nodes]) => {
        // Look up internal config
        const internalPath = [...path, 'internal'];
        let internalConfig = await this.metadataDispatcher.getEntry(internalPath);

        // Create it, if it doesn't exist
        if (!internalConfig) {
          internalConfig = {
            name: 'InternalTransformationRunnerConfiguration',
            configuration: { remoteProcess: undefined },
          };
          await this.metadataDispatcher.putEntry(internalPath, internalConfig);
        }

        // Throw an error if it has the wrong type
        assert(
          internalConfig.name === 'InternalTransformationRunnerConfiguration',
          'Transformation runner has the wrong internal config type',
        )

        // Spawn the remote process
        if (!internalConfig.configuration.remoteProcess) {
          // Pick a node
          const chosenNode: string | undefined = sample(nodes);
          assert(chosenNode, 'No nodes available to allocate a transformation runner process to');

          // Send a spawn process request
          const spawnProcessRequest: SpawnProcessRequest = {
            category: RequestCategory.ProcessControl,
            action: ProcessControlRequestAction.Spawn,
            targetNodeId: chosenNode,
            payload: { processClass: 'TransformationRunner' },
          }
          const newProcessId = await this.rpcInterface.makeRequest(spawnProcessRequest);
          assert(typeof newProcessId !== 'string', `Received invalid response from spawn processes request. Expected: string, received: ${newProcessId}`);

          internalConfig = {
            name: 'InternalTransformationRunnerConfiguration',
            configuration: { remoteProcess: { nodeId: chosenNode, processId: newProcessId } },
          };
          await this.metadataDispatcher.putEntry(internalPath, internalConfig);
        }
      }),
    );
  }
}
