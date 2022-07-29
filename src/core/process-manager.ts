import { FullyQualifiedPath } from '../types/config';
import { FacadeFlagMap, FacadeFlagMapKey } from '../facades/scaffolding/facade-flag-map';
import { BaseFacade, FACADE_FLAGS } from '../facades/scaffolding/base-facade';
import { castFacade } from '../facades/scaffolding/cast-facade';

export class ProcessManager {
  public static async initialize(): Promise<ProcessManager> {
    return new ProcessManager();
  }

  private readonly processes: { [k: string]: BaseFacade } = {};

  private constructor() {}

  register(id: FullyQualifiedPath, component: BaseFacade): void {
    if (this.getProcessByPath(id)) {
      throw new Error(`A component has already been registered with the id: ${id.join('/')}`);
    }

    this.processes[id.join('/')] = component;
  }

  deregister(id: FullyQualifiedPath): void {
    delete this.processes[id.join('/')];
  }

  getProcessByPath(id: FullyQualifiedPath): BaseFacade | undefined {
    return this.processes[id.join('/')];
  }

  getProcessByPathAs<F extends FacadeFlagMapKey>(id: FullyQualifiedPath, flag: F): FacadeFlagMap[F] | undefined {
    const instance = this.getProcessByPath(id);
    if (instance) {
      return castFacade(instance, flag);
    }
  }

  getAllProcessesByFlag<F extends FacadeFlagMapKey>(flag: F): FacadeFlagMap[F][] {
    return Object.values(this.processes)
      .map(instance => castFacade(instance, flag))
      .flatMap(instance => instance ? [instance] : []);
  }
}
