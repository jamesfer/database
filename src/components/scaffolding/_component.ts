import { Refine } from '../../types/refine';

export interface ComponentEquals<C> {
  equals(self: C, other: C): boolean;
}

export interface ComponentStringCodec<C> {
  encodeInString(self: C): string;
  decodeFromString(string: string): C;
}

export interface AllFacades<C> {
  ComponentEquals: ComponentEquals<C>;
  ComponentStringCodec: ComponentStringCodec<C>;
}

export interface ComponentConfiguration<N> {
  readonly NAME: N;
}

enum ComponentName {
  A = 'A',
  B = 'B',
  C = 'C'
}

export interface Component<
  Name extends ComponentName,
  Configuration extends ComponentConfiguration<Name>,
  FacadeKeys extends keyof AllFacades<any>,
> {
  readonly NAME: Name;
  readonly FACADES: Pick<AllFacades<Configuration>, FacadeKeys>;
}

type ComponentConfigurationType<C extends Component<any, any, any>> = C extends Component<any, infer T, any> ? T : never;
type ComponentFacadesType<C extends Component<any, any, any>> = C extends Component<any, any, infer F> ? F : never;

const componentA: Component<ComponentName.A, ComponentConfiguration<ComponentName.A>, 'ComponentEquals'> = 1 as any;
const componentB: Component<ComponentName.B, ComponentConfiguration<ComponentName.B>, 'ComponentStringCodec'> = 1 as any;
const componentC: Component<ComponentName.C, ComponentConfiguration<ComponentName.C>, 'ComponentEquals' | 'ComponentStringCodec'> = 1 as any;

const componentLookup = assertExtends<{ [N in ComponentName]: Component<N, any, any> }>()({
  [componentA.NAME]: componentA,
  [componentB.NAME]: componentB,
  [componentC.NAME]: componentC,
});

function assertExtends<T>() {
  return function <C extends T>(value: C) { return value; };
}


type AnyComponent = (typeof componentLookup)[ComponentName];

type AnyComponentConfiguration = ComponentConfigurationType<AnyComponent>;

type ComponentWithFacades<F extends keyof AllFacades<any>> = ComponentConfigurationType<Refine<AnyComponent, Component<any, any, F>>>

// ----- Select a component type based on facades
const componentWithFacades: ComponentWithFacades<'ComponentEquals'> = 1 as any;

function getComponentByName<N extends ComponentName>(name: N): Component<N, ComponentConfigurationType<Refine<AnyComponent, { NAME: N }>>, ComponentFacadesType<Refine<AnyComponent, { NAME: N }>>> {
  return componentLookup[name] as unknown as any;
}

function componentImplements<F extends keyof AllFacades<any>>(facades: F[], componentConfig: AnyComponentConfiguration): componentConfig is ComponentWithFacades<F > {
  const component = componentLookup[componentConfig.NAME];
  return facades.every(facade => facade in component);
}


// ----- Check a component's type at runtime
function aTestFunction(component: ComponentWithFacades<'ComponentStringCodec'>) {

}
const anUnknownComponentConfig: AnyComponentConfiguration = 1 as any;
if (componentImplements(['ComponentStringCodec'], anUnknownComponentConfig)) {
  const knownComponent = anUnknownComponentConfig;
  aTestFunction(knownComponent);

}


function useComponent<C extends ComponentWithFacades<'ComponentStringCodec'>>(componentConfig: C) {
  // ----- Use a facade at runtime
  const facade = getComponentByName(componentConfig.NAME);
  facade.FACADES.ComponentStringCodec.encodeInString(componentConfig);
}





const st = { NAME: ComponentName.A } as const;
const compImpl = getComponentByName(ComponentName.A);

if ('ComponentEquals' in compImpl.FACADES) {
  compImpl.FACADES.ComponentEquals.equals(st, st);
}

// ----------


class AnotherComponent<Child extends Component<any, any, 'ComponentEquals'>> {
  public value: ComponentConfigurationType<Child> = 1 as any;

  constructor(child: Child) {
  }
}

const comp: Component<'A', { NAME: 'A', value: number }, 'ComponentEquals'> = 1 as any;

const x = new AnotherComponent(comp);
const innerValue = x.value;


// ----------



