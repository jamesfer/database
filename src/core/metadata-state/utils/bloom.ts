import { BloomFilter } from 'bloomfilter';

// Produces ~1% false positive rate
const bitsPerElement = 10;
const k = 7;

export function createBloomFilter(ids: string[]): Int32Array {
  const bloom = new BloomFilter(ids.length * bitsPerElement, 7);
  for (const id of ids) {
    bloom.add(id);
  }
  return bloom.buckets;
}

export function testBloomFilter(filter: Int32Array, id: string): boolean {
  return new BloomFilter(filter, k).test(id);
}
