import { BehaviorSubject } from 'rxjs';
import { FullyQualifiedPath } from '../../types/config';

export default class LifecycleControllerInternalState {
  constructor(
    public readonly id: string,
    public readonly age$: BehaviorSubject<number>,
    public readonly initialStorage$: BehaviorSubject<FullyQualifiedPath>,
    public readonly secondaryStorage$: BehaviorSubject<FullyQualifiedPath>,
  ) {}
}
