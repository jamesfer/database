import { SerializableFacade } from '../../facades/serializable-facade';
import { SimpleInMemoryKeyValueInternalConfiguration } from './simple-in-memory-key-value-internal-configuration';
import { ComponentName } from '../scaffolding/component-name';

export const simpleInMemoryKeyValueInternalSerializableFacade: SerializableFacade<SimpleInMemoryKeyValueInternalConfiguration> = {
  serialize(object: SimpleInMemoryKeyValueInternalConfiguration): string {
    return JSON.stringify({
      name: ComponentName.SimpleMemoryKeyValueInternal,
      remoteProcess: object.remoteProcess,
    });
  },
  deserialize(string: string): SimpleInMemoryKeyValueInternalConfiguration | undefined {
    const json = JSON.parse(string);
    if (json.name !== ComponentName.SimpleMemoryKeyValueInternal) {
      return;
    }
    return new SimpleInMemoryKeyValueInternalConfiguration(json.remoteProcess);
  }
}
