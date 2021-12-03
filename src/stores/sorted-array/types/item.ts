export interface KeyOnlyItem {
  key: string;
}

export class Item implements KeyOnlyItem {
  constructor(
    readonly key: string,
    readonly id: string,
    readonly value: ArrayBuffer,
  ) {}
}
