import { FacadeDictionary, FacadeDictionaryKey } from '../facades/scaffolding/facade-dictionary';
import { BaseFacade } from '../facades/scaffolding/base-facade';
import { castFacade } from '../facades/scaffolding/cast-facade';

export class ProcessManager {
  public static async initialize(): Promise<ProcessManager> {
    return new ProcessManager();
  }

  private readonly processes: { [k: string]: BaseFacade } = {};

  private constructor() {}

  register(id: string, component: BaseFacade): void {
    if (this.getProcessById(id)) {
      throw new Error(`A component has already been registered with the id: ${id}`);
    }

    this.processes[id] = component;
  }

  deregister(id: string): void {
    delete this.processes[id];
  }

  getProcessById(id: string): BaseFacade | undefined {
    return this.processes[id];
  }

  getProcessByIdAs<F extends FacadeDictionaryKey>(id: string, flag: F): FacadeDictionary[F] | undefined {
    const instance = this.getProcessById(id);
    if (instance) {
      return castFacade(instance, flag);
    }
  }

  getAllProcessesByFlag<F extends FacadeDictionaryKey>(flag: F): FacadeDictionary[F][] {
    return Object.values(this.processes)
      .map(instance => castFacade(instance, flag))
      .flatMap(instance => instance ? [instance] : []);
  }
}
