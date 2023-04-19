import { SerializableFacade } from '../../../../facades/serializable-facade';
import { JsonLinesRowBlockInternalConfiguration } from '../json-lines-row-block-internal-configuration';
import { ComponentName } from '../../../scaffolding/component-name';

export const jsonLinesRowBlockInternalSerializableFacade: SerializableFacade<JsonLinesRowBlockInternalConfiguration> = {
  serialize(object) {
    return JSON.stringify({
      name: ComponentName.JsonLinesRowBlockInternal,
      remoteProcess: object.remoteProcess,
    });
  },
  deserialize(string) {
    const json = JSON.parse(string);
    if (!(json && json.name === ComponentName.JsonLinesRowBlockInternal)) {
      return;
    }

    return new JsonLinesRowBlockInternalConfiguration(json.remoteProcess);
  },
};
