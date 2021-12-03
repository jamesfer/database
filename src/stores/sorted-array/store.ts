import { sortedIndexBy } from 'lodash';
import { Bound } from './types/bound';
import { Item, KeyOnlyItem } from './types/item';

export class SortedArrayStore {
  private contents: Item[] = [];

  put(key: string, id: string, value: ArrayBuffer): void {
    const newItem: Item = new Item(key, id, value);
    let insertIndex = this.indexBefore(newItem);
    for (; insertIndex < this.contents.length; insertIndex += 1) {
      const item = this.contents[insertIndex];
      if (item.key !== key) {
        // Reached the end of items with the same key, break the loop and insert the item
        break;
      }

      if (item.id === id) {
        // Overwrite item with existing id
        this.contents[insertIndex] = newItem;
        return;
      }
    }

    // Insert new item at this index
    this.contents.splice(insertIndex, 0, newItem);
  }

  getAll(key: string): ArrayBuffer[] {
    const startIndex = this.indexBefore({ key });
    return this.getValuesWithSameKey(startIndex, key);
  }

  getInRange(from: Bound<KeyOnlyItem>, to: Bound<KeyOnlyItem>): ArrayBuffer[] {
    const startIndex = from.getIndexBy(this.contents, SortedArrayStore.getKey);
    const lastIndex = to.getIndexBy(this.contents, SortedArrayStore.getKey);
    return this.getValuesBetween(startIndex, lastIndex);
  }

  drop(key: string, id: string): void {
    const startIndex = this.indexBefore({ key });
    for (let i = startIndex; i < this.contents.length; i += 1) {
      const item = this.contents[i];
      if (item.key !== key) {
        return;
      }

      if (item.id === id) {
        this.contents.splice(i, 0);
        return;
      }
    }
  }

  private indexBefore(item: KeyOnlyItem): number {
    return sortedIndexBy<KeyOnlyItem>(this.contents, item, SortedArrayStore.getKey);
  }

  private getValuesWithSameKey(startIndex: number, key: string): ArrayBuffer[] {
    let endIndex = startIndex;
    for (; endIndex < this.contents.length && this.contents[endIndex].key === key; endIndex += 1) {}
    return this.getValuesBetween(startIndex, endIndex);
  }

  private getValuesBetween(startIndex: number, lastIndex: number): ArrayBuffer[] {
    const values: ArrayBuffer[] = [];
    for (let i = startIndex; i < this.contents.length && i < lastIndex; i += 1) {
      values.push(this.contents[i].value);
    }
    return values;
  }

  private static getKey(item: KeyOnlyItem): string {
    return item.key;
  }
}
