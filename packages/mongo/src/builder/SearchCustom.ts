import { CustomOperation } from "./CustomOperation"

export class SearchCustom {
  static readonly OPERATION_AND = "AND"
  static readonly OPERATION_OR = "OR"

  constructor(
    public field: string,
    public operation: CustomOperation,
    public value: any
  ) {}

  static of(field: string, operation: CustomOperation, value: any): SearchCustom {
    return new SearchCustom(field, operation, value)
  }
}
