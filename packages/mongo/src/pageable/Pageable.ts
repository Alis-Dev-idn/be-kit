import { IPageable } from "../types"

export class Pageable implements IPageable {
  constructor(
    public page: number,
    public size: number,
    public sort?: string,
    public direction?: "asc" | "desc"
  ) {}

  static of(page: number, size: number, sort?: string, direction?: "asc" | "desc"): Pageable {
    return new Pageable(page, size, sort, direction)
  }
}
