import { AllFacades } from '../../facades/scaffolding/all-facades';
import { ComponentName } from './component-name';
import { Refine } from '../../types/refine';
import { AllComponentsLookup } from './all-components-lookup';
import { AllComponentConfigurations } from './all-component-configurations';


export type RefineComponentLookupByFacades<F extends keyof AllFacades<any>> = {
  [K in keyof AllComponentsLookup as AllComponentsLookup[K] extends { [f in F]: any } ? K : never]: AllComponentsLookup[K];
}

export type RefineComponentNameByFacades<F extends keyof AllFacades<any>> =
  keyof RefineComponentLookupByFacades<F>;

export type RefineComponentConfigurationByFacades<F extends keyof AllFacades<any>> =
  Refine<AllComponentConfigurations, { NAME: RefineComponentNameByFacades<F> }>;


// Runtime type checking of component facades

export function componentNameImplements<F extends keyof AllFacades<any>>(
  facades: F[],
  componentName: string | number | symbol,
): componentName is RefineComponentNameByFacades<F> {
  const componentNameReal: ComponentName = componentName as ComponentName;
  return facades.every(facadeName => facadeName in AllComponentsLookup[componentNameReal]);
}

export function componentConfigurationImplements<F extends keyof AllFacades<any>>(
  facades: F[],
  componentConfig: AllComponentConfigurations,
): componentConfig is RefineComponentConfigurationByFacades<F> {
  return componentNameImplements(facades, componentConfig.NAME);
}

export function getFacade<F extends keyof AllFacades<any>, C extends RefineComponentNameByFacades<F>>(
  componentName: C,
  facade: F
): AllFacades<AllComponentConfigurations>[F];
export function getFacade<F extends keyof AllFacades<any>>(
  componentName: ComponentName,
  facade: F,
): AllFacades<AllComponentConfigurations>[F] | undefined;
export function getFacade<F extends keyof AllFacades<any>, C extends RefineComponentNameByFacades<F>>(
  componentName: ComponentName | C,
  facade: F,
): AllFacades<AllComponentConfigurations>[F] | undefined {
  if (!componentNameImplements([facade], componentName)) {
    return undefined;
  }

  const allComponentsLookupElement = AllComponentsLookup[componentName as ComponentName] as AllFacades<AllComponentConfigurations>;
  return allComponentsLookupElement[facade];
}
