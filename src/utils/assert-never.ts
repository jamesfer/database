export function assertNever(x: never): never {
  throw new Error('Assert never actually called');
}
