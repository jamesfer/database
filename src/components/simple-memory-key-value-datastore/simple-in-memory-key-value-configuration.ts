import { ComponentConfiguration } from '../scaffolding/component-configuration';
import { ComponentName } from '../scaffolding/component-name';

export class SimpleInMemoryKeyValueConfiguration implements ComponentConfiguration<ComponentName.SimpleMemoryKeyValue> {
  readonly NAME = ComponentName.SimpleMemoryKeyValue;
}
