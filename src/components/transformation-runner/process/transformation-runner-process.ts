import { BaseProcess } from '../../../processes/base-process';
import { ProcessType } from '../../../processes/process-type';

export class TransformationRunnerProcess extends BaseProcess<ProcessType.TransformationRunner> {
  public readonly type = ProcessType.TransformationRunner;

  constructor() {
    super();
  }
}
