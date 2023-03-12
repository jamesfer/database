import { SerializableFacade } from '../../../../facades/serializable-facade';
import { TransformationRunnerConfiguration } from '../transformation-runner-configuration';
import { ComponentName } from '../../../scaffolding/component-name';

export const transformationRunnerSerializableFacade: SerializableFacade<TransformationRunnerConfiguration> = {
  serialize(object: TransformationRunnerConfiguration): string {
    return JSON.stringify({ name: ComponentName.TransformationRunner });
  },
  deserialize(string: string): TransformationRunnerConfiguration | undefined {
    const json = JSON.parse(string);
    if (json && json.name === ComponentName.TransformationRunner) {
      return new TransformationRunnerConfiguration();
    }
  },
};
