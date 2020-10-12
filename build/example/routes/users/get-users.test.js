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
const HttpStatus = require("http-status-codes");
const supertest = require("supertest");
const app_1 = require("../../app");
let app;
let userCount = 0;
function createUser() {
    return __awaiter(this, void 0, void 0, function* () {
        userCount += 1;
        const response = yield app.post("/users").send({
            name: `Jack Daniels #${userCount}`,
            email: `jack@daniels-${userCount}.com`,
        });
        return response.body.payload;
    });
}
function createUsers(count) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = [];
        for (let i = 0; i < count; i += 1) {
            users.push(yield createUser());
        }
        return users;
    });
}
describe("get-users", () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        app = supertest(yield app_1.default());
    }));
    it("should return empty list of users when none exist", () => __awaiter(void 0, void 0, void 0, function* () {
        const testUserCount = 0;
        yield createUsers(testUserCount);
        const response = yield app.get("/users").send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.success).toBe(true);
        expect(response.body.payload).toMatchSnapshot();
    }));
    it("should return single created user", () => __awaiter(void 0, void 0, void 0, function* () {
        const testUserCount = 1;
        yield createUsers(testUserCount);
        const response = yield app.get("/users").send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.success).toBe(true);
        expect(response.body.payload).toMatchSnapshot();
    }));
    it("should return first page of multiple pages", () => __awaiter(void 0, void 0, void 0, function* () {
        const testUserCount = 4;
        yield createUsers(testUserCount);
        const response = yield app.get("/users").send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.success).toBe(true);
        expect(response.body.payload).toMatchSnapshot();
    }));
    it("should return second page of multiple pages", () => __awaiter(void 0, void 0, void 0, function* () {
        const testUserCount = 4;
        yield createUsers(testUserCount);
        const response = yield app.get("/users?page=2").send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.success).toBe(true);
        expect(response.body.payload).toMatchSnapshot();
    }));
    it("should allow specifying number of items on a page", () => __awaiter(void 0, void 0, void 0, function* () {
        const testUserCount = 5;
        yield createUsers(testUserCount);
        const response = yield app.get("/users?page=2&itemsPerPage=2").send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.success).toBe(true);
        expect(response.body.payload).toMatchSnapshot();
    }));
    it("should return empty set for page too large", () => __awaiter(void 0, void 0, void 0, function* () {
        const testUserCount = 4;
        yield createUsers(testUserCount);
        const response = yield app.get("/users?page=3").send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.success).toBe(true);
        expect(response.body.payload).toMatchSnapshot();
    }));
    it("should return validation error for invalid page number", () => __awaiter(void 0, void 0, void 0, function* () {
        const testUserCount = 4;
        yield createUsers(testUserCount);
        const response = yield app.get("/users?page=0").send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.success).toBe(false);
        expect(response.body.validationErrors).toMatchSnapshot();
    }));
    it("should return validation error for invalid page number", () => __awaiter(void 0, void 0, void 0, function* () {
        const testUserCount = 4;
        yield createUsers(testUserCount);
        const response = yield app.get("/users?page=-1").send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.success).toBe(false);
        expect(response.body.validationErrors).toMatchSnapshot();
    }));
});
//# sourceMappingURL=get-users.test.js.map