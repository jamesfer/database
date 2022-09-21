import { BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigEntry } from '../../src/config/config-entry';
import { FullyQualifiedPath } from '../../src/config/config';
import { DistributedMetadataInterface } from '../../src/types/distributed-metadata-interface';

export class InMemoryDistributedMetadataHub {
  public readonly configSubject$: Subject<[FullyQualifiedPath, ConfigEntry]> = new Subject();
  public readonly leaderSubject$: BehaviorSubject<string>;

  constructor(initialLeader: string) {
    this.leaderSubject$ = new BehaviorSubject(initialLeader);
  }
}

export class InMemoryDistributedMetadata implements DistributedMetadataInterface {
  readonly commits$ = this.hub.configSubject$.asObservable();
  readonly isLeader$ = this.hub.leaderSubject$.pipe(
    map(leader => leader === this.name),
  );

  constructor(
    private readonly name: string,
    private readonly hub: InMemoryDistributedMetadataHub,
  ) {}

  async write(path: FullyQualifiedPath, configEntry: ConfigEntry): Promise<void> {
    this.hub.configSubject$.next([path, configEntry]);
  }
}
