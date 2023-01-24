import { Refine } from '../types/refine';

export type Key = string | number;

export const switchFunctionOnKey = <K extends Key>(
  switchKey: K,
) => <T extends { [S in K]: Key }, R>(
  individualFunctions: { [V in T[K]]: (t: Refine<T, { [S in K]: V }>) => R },
): (t: T) => R => {
  return (input) => {
    const matchingFunction = individualFunctions[input[switchKey]];
    if (!matchingFunction) {
      throw new Error(`Could not find a matching function. Key property: ${switchKey}, input key: ${input[switchKey]}, known keys: ${Object.keys(individualFunctions).join(', ')}`);
    }

    // Typescript is not able to fully narrow the input type due to all the redirection
    return matchingFunction(input as any);
  }
};
