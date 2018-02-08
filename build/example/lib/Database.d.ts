export interface IDatabaseItem {
    id?: number;
}
export interface IPaginationOptions {
    page: number;
    itemsPerPage: number;
}
export interface IPaginationResult<T> {
    count: number;
    items: T[];
}
export default class Database<T extends IDatabaseItem> {
    private readonly items;
    save(item: T): Promise<T>;
    getById(id: number): Promise<T | undefined>;
    getWhere(field: keyof T, value: any): Promise<T | undefined>;
    getPaginated(paginationOptions: IPaginationOptions, field?: keyof T, value?: any): Promise<IPaginationResult<T>>;
    getNextId(): Promise<number>;
}
