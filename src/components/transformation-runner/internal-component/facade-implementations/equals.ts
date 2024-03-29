import { EqualsFacade } from '../../../../facades/equals-facade';
import { TransformationRunnerInternalConfiguration } from '../transformation-runner-internal-configuration';

export const transformationRunnerInternalEqualsFacade: EqualsFacade<TransformationRunnerInternalConfiguration> = {
  equals(self, other): boolean {
    return true;
  },
};
