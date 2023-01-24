export function assert(condition: unknown, message: string): asserts condition {
  if (condition === false) {
    throw new Error(`Assertion failed: ${message}`);
  }
}
