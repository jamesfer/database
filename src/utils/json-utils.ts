import { Json, JsonArray, JsonRecord, stringify } from 'fp-ts/Json';
import { isArray } from 'lodash';
import { Either, left, right } from 'fp-ts/Either';

export function isRecord(value: Json | undefined): value is JsonRecord {
  return typeof value === 'object'
    && value != null
    && !isArray(value);
}

export function expectRecord(value: Json | undefined): Either<string, JsonRecord> {
  if (isRecord(value)) {
    return right(value);
  }
  return left(`Required value to be a JsonRecord. Actually: ${stringify(value)}`);
}

export function expectArray(value: Json | undefined): Either<string, JsonArray> {
  if (isArray(value)) {
    return right(value);
  }
  return left(`Required value to be a JsonArray. Actually: ${stringify(value)}`);
}

export function expectString(value: Json | undefined): Either<string, string> {
  if (typeof value === 'string') {
    return right(value);
  }
  return left(`Required value to be a string. Actually: ${stringify(value)}`);
}
