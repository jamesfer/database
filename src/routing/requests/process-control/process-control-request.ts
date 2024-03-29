import { FullyQualifiedPath } from '../../../core/metadata-state/config';
import { BaseRequest } from '../base-request';
import { RequestCategory } from '../../types/request-category';

export enum ProcessControlRequestAction {
  Spawn = 'Spawn',
}

// TODO find a better way to handle this
export interface SpawnSimpleMemoryKeyValueProcess {
  processClass: 'SimpleMemoryKeyValueDatastore';
}

export interface SpawnHashPartitionProcess {
  processClass: 'HashPartition';
  parentPath: FullyQualifiedPath;
  partitionIndex: number;
}

export interface SpawnTransformationRunnerProcess {
  processClass: 'TransformationRunner';
}

export type SpawnProcessPayload =
  | SpawnSimpleMemoryKeyValueProcess
  | SpawnHashPartitionProcess
  | SpawnTransformationRunnerProcess;

export interface SpawnProcessRequest extends BaseRequest {
  category: RequestCategory.ProcessControl;
  action: ProcessControlRequestAction.Spawn;
  payload: SpawnProcessPayload;
  targetNodeId: string;
}

export type ProcessControlRequest = SpawnProcessRequest;
