import { Process } from '../processes/process';
import { Refine } from '../types/refine';
import { ProcessType } from '../processes/process-type';

export class ProcessManager {
  public static async initialize(): Promise<ProcessManager> {
    return new ProcessManager();
  }

  private readonly processes: { [k: string]: Process } = {};

  private constructor() {}

  register(id: string, process: Process): void {
    if (this.getProcessById(id)) {
      throw new Error(`A process has already been registered with the id: ${id}`);
    }

    this.processes[id] = process;
  }

  deregister(id: string): void {
    delete this.processes[id];
  }

  getProcessById(id: string): Process | undefined {
    return this.processes[id];
  }

  getProcessByIdAs<T extends ProcessType>(id: string, processType: T): Refine<Process, { type: T }> | undefined {
    const process = this.getProcessById(id);
    if (process && process.type === processType) {
      return process as Refine<Process, { type: T }>;
    }
  }
}
