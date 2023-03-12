import { ComponentName } from '../../scaffolding/component-name';
import { ComponentConfiguration } from '../../scaffolding/component-configuration';

export interface HashPartitionDetails {
  nodeId: string;
  processId: string;
}

export class HashPartitionInternalConfiguration implements ComponentConfiguration<ComponentName.HashPartitionInternal> {
  readonly NAME = ComponentName.HashPartitionInternal;

  constructor(
    public readonly partitionDetails: { [k: number]: HashPartitionDetails },
  ) {}
}
