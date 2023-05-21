import {
  TransformationRunnerConfiguration,
  TransformationRunnerImplementations,
  TransformationRunnerOperator
} from './transformation-runner/transformation-runner-component';
import { Json } from 'fp-ts/Json';
import { assertNever } from '../utils/assert-never';
import { assert } from '../utils/assert';
import { Equals } from '../interfaces/equals';
import { Serializable } from '../interfaces/serializable';
import { DistributedOperator } from '../interfaces/distributed-operator';
import { FullyQualifiedPath } from '../core/metadata-state/config';
import { EMPTY, finalize, Observable, Subject, take } from 'rxjs';
import { concatMap, startWith } from 'rxjs/operators';
import { RpcInterface } from '../rpc/rpc-interface';
import { AnyRequest } from '../routing/requests/any-request';
import { MetadataDispatcherInterface } from '../types/metadata-dispatcher-interface';
import {
  InternalTransformationRunnerConfiguration,
  InternalTransformationRunnerImplementations,
} from './transformation-runner/internal-transformation-runner-component';

export type AnyComponentConfiguration =
  | { name: 'TransformationRunnerConfiguration', configuration: TransformationRunnerConfiguration }
  | { name: 'InternalTransformationRunnerConfiguration', configuration: InternalTransformationRunnerConfiguration };

export type AnyComponentImplementations =
  & Equals<AnyComponentConfiguration>
  & Serializable<AnyComponentConfiguration>;

export const AnyComponentImplementations: AnyComponentImplementations = {
  equals(left, right): boolean {
    switch (left.name) {
      case 'TransformationRunnerConfiguration':
        return right.name === left.name
          && TransformationRunnerImplementations.equals(left.configuration, right.configuration);
      case 'InternalTransformationRunnerConfiguration':
        return right.name === left.name
          && InternalTransformationRunnerImplementations.equals(left.configuration, right.configuration);

      default:
        return assertNever(left);
    }
  },
  serialize(object): Json {
    switch (object.name) {
      case 'TransformationRunnerConfiguration':
        return {
          name: object.name,
          configuration: TransformationRunnerImplementations.serialize(object.configuration),
        };
      case 'InternalTransformationRunnerConfiguration':
        return {
          name: object.name,
          configuration: InternalTransformationRunnerImplementations.serialize(object.configuration),
        };

      default:
        return assertNever(object);
    }
  },
  deserialize(encoded: Json): AnyComponentConfiguration {
    assert(
      typeof encoded === 'object' && encoded && !(encoded instanceof Array),
      'Cannot deserialize encoded Json into AnyComponentConfiguration',
    );

    const { name, nested } = encoded as { name: AnyComponentConfiguration['name'], nested: Json };
    switch (name) {
      case 'TransformationRunnerConfiguration':
        return {
          name,
          configuration: TransformationRunnerImplementations.deserialize(nested),
        };

      case 'InternalTransformationRunnerConfiguration':
        return {
          name,
          configuration: InternalTransformationRunnerImplementations.deserialize(nested),
        };

      default:
        return assertNever(name);
    }
  },
}

export class AnyComponentDistributedOperator implements DistributedOperator<AnyComponentConfiguration> {
  private readonly transformationRunnerDistributedOperator = new TransformationRunnerOperator(
    this.nodes$,
    this.metadataDispatcher,
    this.rpcInterface,
  );

  constructor(
    private readonly nodes$: Observable<string[]>,
    private readonly metadataDispatcher: MetadataDispatcherInterface,
    private readonly rpcInterface: RpcInterface<AnyRequest>,
  ) {}

  distributedOperator(
    path: FullyQualifiedPath,
    events$: Observable<AnyComponentConfiguration>
  ): Observable<void> {
    const subject = new Subject<AnyComponentConfiguration['configuration']>();
    const subscription = events$.subscribe(subject);

    return events$.pipe(
      take(1),
      concatMap((event) => {
        const eventObservable = subject.asObservable().pipe(
          startWith(event.configuration),
        ) as Observable<any>;

        switch (event.name) {
          case 'TransformationRunnerConfiguration':
            return this.transformationRunnerDistributedOperator.distributedOperator(
              path,
              eventObservable,
            );

            // These components are explicitly ignored
          case 'InternalTransformationRunnerConfiguration':
            return EMPTY;

          default:
            assertNever(event);
        }
      }),
      finalize(() => {
        subscription.unsubscribe();
      }),
    );
  }
}
