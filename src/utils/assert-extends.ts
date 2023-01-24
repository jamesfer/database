export function assertExtends<T>() {
  return function <C extends T>(value: C): C { return value; };
}
