import { findHashPartition } from './hash';

describe('hash', () => {
  it('always returns 0 for a single partition', () => {
    expect(findHashPartition(Buffer.from('abc'), 1)).toBe(0);
  });

  it('consistently returns some benchmarked partitions', () => {
    expect(findHashPartition(Buffer.from('abc'), 10)).toBe(7);
  });
});
