import { assert } from "./assert";

describe('assert', () => {
  it('does not throw an error with a true value', () => {
    expect(() => {
      assert(1 === 1, 'Not thrown');
    }).not.toThrow();
  });

  it('throws the diagnostic error with a false value', () => {
    expect(() => {
      assert((1 as any) === (2 as any), 'Message thrown');
    }).toThrow('Message thrown');
  });

  it('does not throw when an object is truthy', () => {
    const value: {} | undefined = {};
    expect(() => {
      assert(value, 'Not thrown');
    }).not.toThrow();
  });

  it('throws when an object is undefined', () => {
    const value: {} | undefined = undefined;
    expect(() => {
      assert(value, 'Is undefined');
    }).toThrow('Is undefined');
  });

  it('throws when an object is null', () => {
    const value: {} | null = null;
    expect(() => {
      assert(value, 'Is null');
    }).toThrow('Is null');
  });
});
