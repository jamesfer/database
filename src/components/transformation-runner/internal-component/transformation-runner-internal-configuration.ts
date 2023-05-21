import { ComponentConfiguration } from '../../scaffolding/component-configuration';
import { ComponentName } from '../../scaffolding/component-name';

export class TransformationRunnerInternalConfiguration implements ComponentConfiguration {
  readonly NAME = ComponentName.TransformationRunnerInternal;

  constructor(
    public readonly remoteProcess: { nodeId: string, processId: string } | undefined,
  ) {}
}
