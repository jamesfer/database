import { EqualsFacade } from '../../../../facades/equals-facade';
import { TransformationRunnerConfiguration } from '../transformation-runner-configuration';

export const transformationRunnerEqualsFacade: EqualsFacade<TransformationRunnerConfiguration> = {
  equals(self: TransformationRunnerConfiguration, other: TransformationRunnerConfiguration): boolean {
    return true;
  },
};
