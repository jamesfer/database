import { BaseProcess } from '../../processes/base-process';
import { ProcessType } from '../../processes/process-type';
import { sortBy } from 'lodash';

interface Span {
  id: string;
  time: number;
  service: string;
  tags: { [k: string]: string };
}

// interface LSMSortedSkipListIndex<K> {
//   sortedSkipList: [K, number][];
// }

interface LSMHashSkipListIndex<K extends string | number> {
  hashSkipList: { [k in K]: number };
}

type LSMIndex<K extends string | number> = LSMHashSkipListIndex<K>;

interface LSMTable {
  // filter: any;
  data: Span[];
  indexes: LSMIndex<any>[];
}

class LSMDataStore {
  private log: Span[] = [];
  private tables: LSMTable[] [];

  write(data: Span): void {
    this.log.push(data);

    // TODO update tables
  }

  getById(id: string): Span | undefined {

  }

  getByTimeRange(from: number, to: number): Span[] {

  }

  private compressFlushLog(log: Span[]): LSMTable {
    // Sort logs by time
    const sortedLogs = sortBy(log, 'time');

    // Build id index
    const idIndex: LSMIndex<string> = this.buildIdIndex(sortedLogs);

    return {
      data: sortedLogs,
      indexes: [idIndex],
    };
  }
}

export class LogStructuredMergeProcess implements BaseProcess<ProcessType.LogStructuredMerge> {
  readonly type = ProcessType.LogStructuredMerge;

  constructor(

  ) {}
}
