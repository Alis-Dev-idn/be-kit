import { SearchCustom } from "./SearchCustom"

export class MultipleSearch {
  constructor(
    public operation: string,
    public searches: (SearchCustom | MultipleSearch)[]
  ) {}

  static of(operation: string, ...searches: (SearchCustom | MultipleSearch)[]): MultipleSearch {
    return new MultipleSearch(operation, searches)
  }
}
