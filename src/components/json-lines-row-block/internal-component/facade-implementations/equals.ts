import { EqualsFacade } from '../../../../facades/equals-facade';
import { JsonLinesRowBlockInternalConfiguration } from '../json-lines-row-block-internal-configuration';

export const jsonLinesRowBlockInternalEqualsFacade: EqualsFacade<JsonLinesRowBlockInternalConfiguration> = {
  equals(self, other) {
    return self.remoteProcess?.processId == other.remoteProcess?.processId
      && self.remoteProcess?.nodeId == other.remoteProcess?.nodeId;
  }
};
