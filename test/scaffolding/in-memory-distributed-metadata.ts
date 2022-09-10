import { BaseFacade, FACADES_KEY } from '../../src/facades/scaffolding/base-facade';
import {
  DISTRIBUTED_METADATA_FACADE_FLAG,
  DistributedMetadataFacade
} from '../../src/facades/distributed-metadata-facade';
import { BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigEntry } from '../../src/config/config-entry';

export class InMemoryDistributedMetadataHub {
  public readonly configSubject$: Subject<ConfigEntry> = new Subject();
  public readonly leaderSubject$: BehaviorSubject<string>;

  constructor(initialLeader: string) {
    this.leaderSubject$ = new BehaviorSubject(initialLeader);
  }
}

export class InMemoryDistributedMetadata implements BaseFacade, DistributedMetadataFacade {
  readonly [FACADES_KEY]: DistributedMetadataFacade[FACADES_KEY] = {
    [DISTRIBUTED_METADATA_FACADE_FLAG]: this,
  };

  readonly commits$ = this.hub.configSubject$.asObservable();
  readonly isLeader$ = this.hub.leaderSubject$.pipe(
    map(leader => leader === this.name),
  );

  constructor(
    private readonly name: string,
    private readonly hub: InMemoryDistributedMetadataHub,
  ) {}

  async write(configEntry: ConfigEntry): Promise<void> {
    this.hub.configSubject$.next(configEntry);
  }
}
