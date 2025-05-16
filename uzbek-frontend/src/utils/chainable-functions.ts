export class ChainableArray<T> extends Array<T> {
  constructor(items?: T[]) {
    super(...(Array.isArray(items) ? items : []));
  }

  /**
   * Create a new chainable array with transformed values
   */
  pipe<V>(transform: (arr: T[]) => V[]): ChainableArray<V> {
    const result = transform([...this]);
    return new ChainableArray<V>(result);
  }

  /**
   * Transform the array into a non-chainable value
   */
  transform<V>(transform: (arr: T[]) => V): V {
    return transform([...this]);
  }
}