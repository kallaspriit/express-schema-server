"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatus = require("http-status-codes");
const supertest = require("supertest");
const app_1 = require("../../app");
let app;
describe("create-user", () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        app = supertest(yield app_1.default());
    }));
    it("should register valid user", () => __awaiter(this, void 0, void 0, function* () {
        const response = yield app.post("/users").send({
            name: "Jack Daniels",
            email: "jack@daniels.com",
        });
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.success).toBe(true);
        expect(response.body.payload).toMatchSnapshot();
    }));
    it("should return validation error for invalid email", () => __awaiter(this, void 0, void 0, function* () {
        const response = yield app.post("/users").send({
            name: "Jack Daniels",
            email: "jack@daniels",
        });
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.success).toBe(false);
        expect(response.body.payload).toMatchSnapshot();
    }));
    it("should return validation error for duplicate email", () => __awaiter(this, void 0, void 0, function* () {
        const response1 = yield app.post("/users").send({
            name: "Jack Daniels",
            email: "jack@daniels.com",
        });
        expect(response1.status).toEqual(HttpStatus.OK);
        expect(response1.body.success).toBe(true);
        expect(response1.body.payload).toMatchSnapshot();
        const response2 = yield app.post("/users").send({
            name: "Jack Daniels",
            email: "jack@daniels.com",
        });
        expect(response2.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response2.body.success).toBe(false);
        expect(response2.body.payload).toMatchSnapshot();
    }));
});
//# sourceMappingURL=create-user.test.js.map