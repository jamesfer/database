import { SerializableFacade } from '../../../../facades/serializable-facade';
import { ComponentName } from '../../../scaffolding/component-name';
import { TransformationRunnerInternalConfiguration } from '../transformation-runner-internal-configuration';

export const transformationRunnerInternalSerializableFacade: SerializableFacade<TransformationRunnerInternalConfiguration> = {
  serialize(object) {
    return JSON.stringify({
      name: ComponentName.TransformationRunnerInternal,
      remoteProcess: object.remoteProcess,
    });
  },
  deserialize(string) {
    const json = JSON.parse(string);
    if (!(json && json.name === ComponentName.TransformationRunnerInternal)) {
      return;
    }

    return new TransformationRunnerInternalConfiguration(json.remoteProcess);
  },
};
