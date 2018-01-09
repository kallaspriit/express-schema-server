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
const supertest = require("supertest");
const app_1 = require("../../app");
const users_1 = require("./users");
let app;
describe("get-user-route", () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        app = supertest(yield app_1.default());
    }));
    it("should return registered user info", () => __awaiter(this, void 0, void 0, function* () {
        const createResponse = yield app.post("/users").send({
            name: "Jack Daniels",
            email: "jack@daniels.com"
        });
        expect(createResponse.status).toEqual(200);
        expect(createResponse.body.success).toBe(true);
        expect(createResponse.body.payload).toMatchSnapshot();
        const getResponse = yield app.get(`/users/${createResponse.body.payload.id}`).send();
        expect(getResponse.status).toEqual(200);
        expect(getResponse.body.success).toBe(true);
        expect(getResponse.body.payload).toMatchSnapshot();
    }));
    it("should return validation error for invalid user id", () => __awaiter(this, void 0, void 0, function* () {
        const getResponse = yield app.get("/users/abc").send();
        expect(getResponse.status).toEqual(400);
        expect(getResponse.body.success).toBe(false);
        expect(getResponse.body.validationErrors).toMatchSnapshot();
    }));
    it("should return 404 not found for non-existing user", () => __awaiter(this, void 0, void 0, function* () {
        const getResponse = yield app.get(`/users/666`).send();
        expect(getResponse.status).toEqual(404);
        expect(getResponse.text).toMatchSnapshot();
    }));
    it("transformUser removes excessive data", () => __awaiter(this, void 0, void 0, function* () {
        const fullInfo = {
            name: "Jack Daniels",
            email: "jack@daniels.com",
            password: "xxx"
        };
        const transformedInfo = users_1.transformUser(fullInfo);
        expect(transformedInfo).toMatchSnapshot();
    }));
});
//# sourceMappingURL=get-user-route.test.js.map