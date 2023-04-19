import { ComponentConfiguration } from '../../scaffolding/component-configuration';
import { ComponentName } from '../../scaffolding/component-name';

export class JsonLinesRowBlockInternalConfiguration implements ComponentConfiguration<ComponentName.JsonLinesRowBlockInternal> {
  readonly NAME = ComponentName.JsonLinesRowBlockInternal;

  constructor(
    public readonly remoteProcess: { nodeId: string, processId: string } | undefined,
  ) {}
}
