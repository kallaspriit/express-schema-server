"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// in-memory database of given database items
class Database {
    constructor() {
        this.items = [];
    }
    // gives the new item an id, saves it and returns it
    save(item) {
        return __awaiter(this, void 0, void 0, function* () {
            item.id = yield this.getNextId();
            this.items.push(item);
            return item;
        });
    }
    // fetches item by id
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getWhere("id", id);
        });
    }
    // fetches items by any of the properties
    getWhere(field, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.items.find((item) => item[field] === value);
        });
    }
    // fetches items by any of the properties
    getPaginated(paginationOptions, field, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const filteredItems = field ? this.items.filter((item) => item[field] === value) : this.items;
            const count = filteredItems.length;
            const startIndex = (paginationOptions.page - 1) * paginationOptions.itemsPerPage;
            const items = filteredItems.slice(startIndex, startIndex + paginationOptions.itemsPerPage);
            return {
                count,
                items,
            };
        });
    }
    // return next item id
    getNextId() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.items.length + 1;
        });
    }
}
exports.default = Database;
//# sourceMappingURL=Database.js.map