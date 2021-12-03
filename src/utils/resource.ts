export class Resource<T> {
  constructor(private readonly make: () => [T, () => void]) {}

  async use<R>(f: (value: T) => Promise<R>): Promise<R> {
    const [value, close] = this.make();
    return f(value).then(
      (result) => {
        close();
        return result;
      },
      // Use the second argument of .then because we don't want to catch errors thrown by close()
      (error) => {
        close();
        return Promise.reject(error);
      },
    );
  }

  flatMap<R>(f: (outer: T) => Resource<R>): Resource<R> {
    return new Resource<R>(() => {
      const [outer, closeOuter] = this.make();
      const [inner, closeInner] = f(outer).make();
      return [
        inner,
        () => {
          closeInner();
          closeOuter();
        },
      ];
    });
  }
}
