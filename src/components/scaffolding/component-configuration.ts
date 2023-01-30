import { ComponentName } from './component-name';

export interface ComponentConfiguration<N extends ComponentName> {
  readonly NAME: N;
}
