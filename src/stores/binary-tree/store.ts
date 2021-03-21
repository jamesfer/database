import bindings from 'bindings';
import { NBTreeAddon } from '../../../addons/nbtree/nbtree-addon';

const btreeImplementation: NBTreeAddon = bindings('nbtree.node');

export class BinaryTreeStore {
  put(key: string, value: ArrayBuffer): void {

  }

  get(key: string): ArrayBuffer | undefined {

  }

  drop(key: string): void {

  }
}
