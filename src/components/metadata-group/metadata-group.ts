import { sampleSize } from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseFacade, FACADE_FLAGS } from '../../facades/scaffolding/base-facade';
import { FacadeFlagMap } from '../../facades/scaffolding/facade-flag-map';
import { MetadataGroupEntry } from '../../types/config';

export class MetadataGroup implements BaseFacade {
  readonly [FACADE_FLAGS]: Partial<FacadeFlagMap> = {};

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
