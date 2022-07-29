import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseFacade, FACADE_FLAGS } from '../../facades/scaffolding/base-facade';
import { FacadeFlagMap } from '../../facades/scaffolding/facade-flag-map';
import { MetadataGroupEntry } from '../../types/config';
import { MetadataDispatcher } from '../../core/metadata-state/metadata-dispatcher';

export class MetadataGroupLeader implements BaseFacade {
  readonly [FACADE_FLAGS]: Partial<FacadeFlagMap> = {};

  static async initialize(
    key: string,
    configState$: Observable<MetadataGroupEntry>,
    metadataDispatcher: MetadataDispatcher,
  ): Promise<MetadataGroupLeader> {
    return new MetadataGroupLeader(key, configState$, metadataDispatcher);
  }

  private readonly subscription = this.configState$.pipe(
    map(config => {
      // TODO create a new metadata dispatcher
    }),
  ).subscribe();

  private constructor(
    private readonly key: string,
    private readonly configState$: Observable<MetadataGroupEntry>,
    private readonly metadataDispatcher: MetadataDispatcher,
  ) {}

  async cleanup() {
    this.subscription.unsubscribe();
  }
}
