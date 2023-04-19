import { ProcessType } from '../../../processes/process-type';
import { BaseProcess } from '../../../processes/base-process';

export class JsonLinesRowBlockProcess extends BaseProcess<ProcessType.JsonLinesRowBlock> {
  public readonly type = ProcessType.JsonLinesRowBlock;

  constructor(public readonly processId: string) {
    super();
  }
}
