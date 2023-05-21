import { Equals } from '../../interfaces/equals';
import { Serializable } from '../../interfaces/serializable';
import { Json } from 'fp-ts/Json';
import { assert } from '../../utils/assert';

export interface InternalTransformationRunnerConfiguration {
  remoteProcess: { nodeId: string, processId: string } | undefined;
}

export type InternalTransformationRunnerImplementations =
  & Equals<InternalTransformationRunnerConfiguration>
  & Serializable<InternalTransformationRunnerConfiguration>

export const InternalTransformationRunnerImplementations: InternalTransformationRunnerImplementations = {
  equals(left, right): boolean {
    return left.remoteProcess?.processId === right.remoteProcess?.processId
      && left.remoteProcess?.nodeId === right.remoteProcess?.nodeId;
  },
  serialize(object): Json {
    return { remoteProcess: object.remoteProcess || null };
  },
  deserialize(encoded): InternalTransformationRunnerConfiguration {
    assert(
      typeof encoded === 'object' && encoded && !(encoded instanceof Array),
      'Cannot deserialize encoded Json into InternalTransformationRunnerConfiguration',
    );

    const { remoteProcess } = encoded as { remoteProcess: { nodeId: string, processId: string } | null };
    return { remoteProcess: remoteProcess || undefined };
  },
};
