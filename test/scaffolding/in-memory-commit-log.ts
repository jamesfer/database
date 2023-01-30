import { BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { FullyQualifiedPath } from '../../src/core/metadata-state/config';
import { DistributedCommitLogInterface } from '../../src/types/distributed-commit-log-interface';
import { AllComponentConfigurations } from '../../src/components/scaffolding/all-component-configurations';

export class InMemoryCommitLogHub {
  public readonly configSubject$: Subject<[FullyQualifiedPath, AllComponentConfigurations]> = new Subject();
  public readonly leaderSubject$: BehaviorSubject<string>;

  constructor(initialLeader: string) {
    this.leaderSubject$ = new BehaviorSubject(initialLeader);
  }
}

export class InMemoryCommitLog implements DistributedCommitLogInterface<AllComponentConfigurations> {
  readonly commits$ = this.hub.configSubject$.asObservable();
  readonly isLeader$ = this.hub.leaderSubject$.pipe(
    map(leader => leader === this.name),
  );

  constructor(
    private readonly name: string,
    private readonly hub: InMemoryCommitLogHub,
  ) {}

  async write(path: FullyQualifiedPath, configEntry: AllComponentConfigurations): Promise<void> {
    this.hub.configSubject$.next([path, configEntry]);
  }
}
