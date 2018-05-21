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
export default class Database<T extends DatabaseItem> {
    private readonly items;
    save(item: T): Promise<T>;
    getById(id: number): Promise<T | undefined>;
    getWhere(field: keyof T, value: any): Promise<T | undefined>;
    getPaginated(paginationOptions: PaginationOptions, field?: keyof T, value?: any): Promise<PaginationResult<T>>;
    getNextId(): Promise<number>;
}
