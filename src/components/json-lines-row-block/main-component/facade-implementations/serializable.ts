import { SerializableFacade } from '../../../../facades/serializable-facade';
import { JsonLinesRowBlockConfiguration } from '../json-lines-row-block-configuration';
import { ComponentName } from '../../../scaffolding/component-name';

export const jsonLinesRowBlockSerializableFacade: SerializableFacade<JsonLinesRowBlockConfiguration> = {
  serialize(object) {
    return JSON.stringify({ name: ComponentName.JsonLinesRowBlock });
  },
  deserialize(string) {
    const json = JSON.parse(string);
    if (json && json.name === ComponentName.JsonLinesRowBlock) {
      return new JsonLinesRowBlockConfiguration();
    }
  },
};
