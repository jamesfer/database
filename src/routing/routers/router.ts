type ElementType<A> = A extends Array<infer T> ? T : unknown;

export type ActionRouter<As extends Action<any, any>[]> = (request: ElementType<As>['request']) => Promise<ElementType<As>['request']>;
