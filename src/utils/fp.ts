import { Either, sequenceArray } from 'fp-ts/Either';

// export function sequenceTuple()
export function sequenceTuple<Err, A>(as: [Either<Err, A>]): Either<Err, [A]>;
export function sequenceTuple<Err, A, B>(as: [Either<Err, A>, Either<Err, B>]): Either<Err, [A, B]>;
export function sequenceTuple<Err, A, B, C>(as: [Either<Err, A>, Either<Err, B>, Either<Err, C>]): Either<Err, [A, B, C]>;
export function sequenceTuple<Err, A, B, C, D>(as: [Either<Err, A>, Either<Err, B>, Either<Err, C>, Either<Err, D>]): Either<Err, [A, B, C, D]>;
export function sequenceTuple<Err, A, B, C, D, E>(as: [Either<Err, A>, Either<Err, B>, Either<Err, C>, Either<Err, D>, Either<Err, E>]): Either<Err, [A, B, C, D, E]>;
export function sequenceTuple<Err, T>(as: ReadonlyArray<Either<Err, T>>): Either<Err, ReadonlyArray<T>> {
  return sequenceArray(as);
}
