// database items have an optional numeric id
export interface IDatabaseItem {
	id?: number;
}

// in-memory database of given database items
export default class Database<T extends IDatabaseItem> {
	private items: T[] = [];

	// gives the new item an id, saves it and returns it
	public async save(item: T): Promise<T> {
		item.id = await this.getNextId();

		this.items.push(item);

		return item;
	}

	// fetches item by id
	public async getById(id: number): Promise<T | undefined> {
		return this.find('id', id);
	}

	// fetches items by any of the properties
	public async find(field: keyof T, value: any): Promise<T | undefined> {
		return this.items.find(item => item[field] === value);
	}

	// return next item id
	public async getNextId(): Promise<number> {
		return this.items.length + 1;
	}
}
