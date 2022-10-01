import { BehaviorSubject, concat, NEVER, Observable, of, Unsubscribable } from 'rxjs';

export interface MembershipListInterface {
  nodes$: Observable<string[]>;
}

export class StaticMembershipList implements MembershipListInterface {
  public readonly nodes$ = concat(of(this.staticNodeList), NEVER);

  static async initialize(staticNodeList: string[]): Promise<StaticMembershipList> {
    return new StaticMembershipList(staticNodeList);
  }

  private constructor(private readonly staticNodeList: string[]) {}
}
