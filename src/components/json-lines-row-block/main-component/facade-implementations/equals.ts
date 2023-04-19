import { EqualsFacade } from '../../../../facades/equals-facade';
import { JsonLinesRowBlockConfiguration } from '../json-lines-row-block-configuration';

export const jsonLinesRowBlockEqualsFacade: EqualsFacade<JsonLinesRowBlockConfiguration> = {
  equals(self, other) {
    return true;
  }
};
