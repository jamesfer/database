import { ProcessType } from './process-type';

export abstract class BaseProcess<T extends ProcessType> {
  public abstract readonly type: T;

  protected constructor() {}
}
