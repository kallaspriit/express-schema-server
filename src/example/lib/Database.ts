// database items have an optional numeric id
export interface DatabaseItem {
  id?: number;
}

export interface PaginationOptions {
  page: number;
  itemsPerPage: number;
}

export interface PaginationResult<T> {
  count: number;
  items: T[];
}

// in-memory database of given database items
export default class Database<T extends DatabaseItem> {
  private readonly items: T[] = [];

  // gives the new item an id, saves it and returns it
  public async save(item: T): Promise<T> {
    item.id = await this.getNextId();

    this.items.push(item);

    return item;
  }

  // fetches item by id
  public async getById(id: number): Promise<T | undefined> {
    return this.getWhere("id", id);
  }

  // fetches items by any of the properties
  public async getWhere(field: keyof T, value: any): Promise<T | undefined> {
    return this.items.find(item => item[field] === value);
  }

  // fetches items by any of the properties
  public async getPaginated(
    paginationOptions: PaginationOptions,
    field?: keyof T,
    value?: any,
  ): Promise<PaginationResult<T>> {
    const filteredItems = field ? this.items.filter(item => item[field] === value) : this.items;
    const count = filteredItems.length;
    const startIndex = (paginationOptions.page - 1) * paginationOptions.itemsPerPage;
    const items = filteredItems.slice(startIndex, startIndex + paginationOptions.itemsPerPage);

    return {
      count,
      items,
    };
  }

  // return next item id
  public async getNextId(): Promise<number> {
    return this.items.length + 1;
  }
}
