import { ComponentConfiguration } from '../scaffolding/component-configuration';
import { ComponentName } from '../scaffolding/component-name';

export class SimpleInMemoryKeyValueInternalConfiguration implements ComponentConfiguration<
  ComponentName.SimpleMemoryKeyValueInternal
> {
  readonly NAME = ComponentName.SimpleMemoryKeyValueInternal;

  constructor(
    public readonly remoteProcess: { nodeId: string, processId: string } | undefined,
  ) {}
}
