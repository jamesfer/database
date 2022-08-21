import { sampleSize } from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseFacade, FACADES_KEY } from '../../facades/scaffolding/base-facade';
import { FacadeDictionary } from '../../facades/scaffolding/facade-dictionary';
import { MetadataGroupEntry } from '../../types/config';

export class MetadataGroup implements BaseFacade {
  readonly [FACADES_KEY]: Partial<FacadeDictionary> = {};

  static async initialize(
    key: string,
    configState$: Observable<MetadataGroupEntry>,
    otherGroupMembers: string[],
  ): Promise<MetadataGroup> {
    return new MetadataGroup(key, configState$, otherGroupMembers);
  }

  private readonly subscription = this.configState$.pipe(
    map(config => {
      // Find leaders to join the group
      const newLeaders = sampleSize(this.otherGroupMembers, config.groupSize);

      // Request leaders join a new group
      // TODO

    }),
  ).subscribe();

  private constructor(
    private readonly key: string,
    private readonly configState$: Observable<MetadataGroupEntry>,
    private readonly otherGroupMembers: string[],
  ) {}

  async cleanup() {
    this.subscription.unsubscribe();
  }
}
