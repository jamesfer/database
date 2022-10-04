import { BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigEntry } from '../../src/config/config-entry';
import { FullyQualifiedPath } from '../../src/config/config';
import { DistributedCommitLogInterface } from '../../src/types/distributed-commit-log-interface';

export class InMemoryCommitLogHub {
  public readonly configSubject$: Subject<[FullyQualifiedPath, ConfigEntry]> = new Subject();
  public readonly leaderSubject$: BehaviorSubject<string>;

  constructor(initialLeader: string) {
    this.leaderSubject$ = new BehaviorSubject(initialLeader);
  }
}

export class InMemoryCommitLog implements DistributedCommitLogInterface<ConfigEntry> {
  readonly commits$ = this.hub.configSubject$.asObservable();
  readonly isLeader$ = this.hub.leaderSubject$.pipe(
    map(leader => leader === this.name),
  );

  constructor(
    private readonly name: string,
    private readonly hub: InMemoryCommitLogHub,
  ) {}

  async write(path: FullyQualifiedPath, configEntry: ConfigEntry): Promise<void> {
    this.hub.configSubject$.next([path, configEntry]);
  }
}
