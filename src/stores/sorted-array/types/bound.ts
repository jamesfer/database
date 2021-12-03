import { sortedIndexBy, sortedLastIndexBy } from "lodash";

export abstract class Bound<T> {
  protected constructor() {}

  abstract getIndexBy(collection: T[], iteratee: (value: T) => unknown): number;

  static at<T>(value: T, inclusive: boolean): Bound<T> {
    return new PointBound(value, inclusive);
  }

  static get lowest(): Bound<any> {
    return LowestBound;
  }

  static get highest(): Bound<any> {
    return HighestBound;
  }
}

class PointBound<T> extends Bound<T> {
  constructor(private readonly value: T, private readonly inclusive: boolean) {
    super();
  }

  getIndexBy(collection: T[], iteratee: (value: T) => unknown): number {
    return (this.inclusive ? sortedIndexBy : sortedLastIndexBy)(collection, this.value, iteratee);
  }
}

const LowestBound = new class extends Bound<any> {
  constructor() {
    super();
  }

  getIndexBy(collection: any[]): number {
    return 0;
  }
}

const HighestBound = new class extends Bound<any> {
  constructor() {
    super();
  }

  getIndexBy(collection: any[]): number {
    return collection.length;
  }
}



