export interface IDatabaseItem {
    id?: number;
}
export default class Database<T extends IDatabaseItem> {
    private items;
    save(item: T): Promise<T>;
    getById(id: number): Promise<T | undefined>;
    find(field: keyof T, value: any): Promise<T | undefined>;
    getNextId(): Promise<number>;
}
