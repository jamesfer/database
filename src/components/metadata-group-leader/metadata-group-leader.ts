import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseFacade, FACADES_KEY } from '../../facades/scaffolding/base-facade';
import { FacadeDictionary } from '../../facades/scaffolding/facade-dictionary';
import { MetadataGroupEntry } from '../../types/config';
import { MetadataDispatcher } from '../../core/metadata-state/metadata-dispatcher';

export class MetadataGroupLeader implements BaseFacade {
  readonly [FACADES_KEY]: Partial<FacadeDictionary> = {};

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
