import { CustomOperation } from "./CustomOperation"
import { SearchCustom } from "./SearchCustom"
import { MultipleSearch } from "./MultipleSearch"
import { BuiltQuery } from "../types"

export class CustomBuilder<T = any> {
  private conditions: (SearchCustom | MultipleSearch)[] = []

  with(condition: SearchCustom | MultipleSearch): this {
    this.conditions.push(condition)
    return this
  }

  build(): BuiltQuery<T> {
    if (this.conditions.length === 0) return { filter: {} }

    const filters = this.conditions.map(c => this.parseCondition(c))
    return {
      filter: filters.length === 1 ? filters[0] : { $and: filters }
    }
  }

  private parseCondition(condition: SearchCustom | MultipleSearch): any {
    if (condition instanceof MultipleSearch) {
      const op = condition.operation === SearchCustom.OPERATION_OR ? "$or" : "$and"
      return { [op]: condition.searches.map(s => this.parseCondition(s)) }
    }

    const { field, operation, value } = condition

    switch (operation) {
      case CustomOperation.EQUAL: return { [field]: value }
      case CustomOperation.NOT_EQUAL: return { [field]: { $ne: value } }
      case CustomOperation.GT: return { [field]: { $gt: value } }
      case CustomOperation.GTE: return { [field]: { $gte: value } }
      case CustomOperation.LT: return { [field]: { $lt: value } }
      case CustomOperation.LTE: return { [field]: { $lte: value } }
      case CustomOperation.LIKE: return { [field]: { $regex: value, $options: "i" } }
      case CustomOperation.STARTS_WITH: return { [field]: { $regex: `^${value}`, $options: "i" } }
      case CustomOperation.ENDS_WITH: return { [field]: { $regex: `${value}$`, $options: "i" } }
      case CustomOperation.IN: return { [field]: { $in: Array.isArray(value) ? value : [value] } }
      case CustomOperation.NOT_IN: return { [field]: { $nin: Array.isArray(value) ? value : [value] } }
      
      // Join operations are treated same as normal for now in this simple implementation
      // usually they might involve $lookup if not embedded
      case CustomOperation.OPERATION_JOIN_EQUAL: return { [field]: value }
      case CustomOperation.OPERATION_JOIN_LIKE: return { [field]: { $regex: value, $options: "i" } }
      case CustomOperation.OPERATION_JOIN_IN: return { [field]: { $in: Array.isArray(value) ? value : [value] } }
      case CustomOperation.OPERATION_JOIN_GT: return { [field]: { $gt: value } }
      case CustomOperation.OPERATION_JOIN_GTE: return { [field]: { $gte: value } }
      case CustomOperation.OPERATION_JOIN_LT: return { [field]: { $lt: value } }
      case CustomOperation.OPERATION_JOIN_LTE: return { [field]: { $lte: value } }

      default: return { [field]: value }
    }
  }
}
