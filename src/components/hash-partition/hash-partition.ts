import { BaseFacade, FACADES_KEY } from '../../facades/scaffolding/base-facade';
import { Observable } from 'rxjs';

export class HashPartition implements BaseFacade {
  readonly [FACADES_KEY] = {};

  static async initialize(
    key: string,
    config$: Observable<any>,
  ): Promise<HashPartition> {
    return new HashPartition(key, config$);
  }

  private constructor(
    private readonly key: string,
    private readonly config$: Observable<any>,
  ) {}


}
