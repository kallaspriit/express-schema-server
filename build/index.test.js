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
const app_1 = require("./example/app");
const index_1 = require("./index");
let app;
const normalSchema = {
    title: "Test schema",
    description: "Testing JSON schema",
    type: "object",
    properties: {
        name: {
            title: "Name",
            description: "User name",
            type: "string",
            minLength: 3,
        },
    },
    required: ["name"],
};
const errorSchema = {
    title: "Test schema",
    description: "Testing JSON schema",
    type: "object",
    properties: {
        name: {
            title: "Name",
            description: "User name",
            type: "string",
            minLength: 3,
            format: "throws-error",
        },
    },
    required: ["name"],
};
function validateThrowsError() {
    return {
        name: "throws-error",
        validate: (_value) => __awaiter(this, void 0, void 0, function* () {
            throw new Error("Validator error message");
        }),
    };
}
describe("express-schema-server", () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        app = supertest(yield app_1.default());
    }));
    it("provides schema endpoint for all endpoints", () => __awaiter(void 0, void 0, void 0, function* () {
        const getResponse = yield app.get("/schema").send();
        expect(getResponse.status).toEqual(HttpStatus.OK);
        expect(getResponse.body).toMatchSnapshot();
    }));
    it("provides schema endpoint for specific endpoints", () => __awaiter(void 0, void 0, void 0, function* () {
        const getResponse = yield app.get("/schema/users/post").send();
        expect(getResponse.status).toEqual(HttpStatus.OK);
        expect(getResponse.body).toMatchSnapshot();
    }));
    it("performs valid json schema validation", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            name: "Jack Daniels",
        };
        const validationResult = yield index_1.validateJsonSchema(data, normalSchema);
        expect(validationResult).toMatchSnapshot();
    }));
    it("performs invalid json schema validation", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            name: "J",
        };
        const validationResult = yield index_1.validateJsonSchema(data, normalSchema);
        expect(validationResult).toMatchSnapshot();
    }));
    it("schema validation fails if missing validator", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            name: "Jack Daniels",
        };
        const validationResult = yield index_1.validateJsonSchema(data, errorSchema, [validateThrowsError()]);
        expect(validationResult).toMatchSnapshot();
    }));
    it("provides detailed error class", () => __awaiter(void 0, void 0, void 0, function* () {
        const error = new index_1.DetailedError("Message", { foo: "bar" });
        expect(error).toMatchSnapshot();
    }));
    it("provides detailed error class, details are optional", () => __awaiter(void 0, void 0, void 0, function* () {
        const error = new index_1.DetailedError("Message");
        expect(error).toMatchSnapshot();
    }));
    it("provides helper for pagination page options", () => __awaiter(void 0, void 0, void 0, function* () {
        const options = index_1.getPaginationPageOptions({
            page: "2",
            itemsPerPage: "5",
        });
        expect(options).toMatchSnapshot();
    }));
    it("provides helper for pagination page options, one can specify default items per page", () => __awaiter(void 0, void 0, void 0, function* () {
        const defaultItemsPerPage = 5;
        const options = index_1.getPaginationPageOptions({
            page: "2",
            itemsPerPage: "5",
        }, defaultItemsPerPage);
        expect(options).toMatchSnapshot();
    }));
    it("provides helper for combining messages", () => __awaiter(void 0, void 0, void 0, function* () {
        const message1 = index_1.combineMessages([]);
        const message2 = index_1.combineMessages(["Test1"]);
        const message3 = index_1.combineMessages(["Test1", "Test2"]);
        const message4 = index_1.combineMessages(["Test1", "Test2", "Test3"]);
        expect(message1).toMatchSnapshot();
        expect(message2).toMatchSnapshot();
        expect(message3).toMatchSnapshot();
        expect(message4).toMatchSnapshot();
    }));
    it("sorts routes correctly", () => __awaiter(void 0, void 0, void 0, function* () {
        const routes = [
            { group: "invites", path: "/:inviteId" },
            { group: "admins", path: "/" },
            { group: "users", path: "/" },
            { group: "users", path: "/:id" },
            { group: "users", path: "/deleted" },
            { group: "admins", path: "/b" },
            { group: "invites", path: "/" },
            { group: "admins", path: "/:id" },
            { group: "invites", path: "/users" },
            { group: "admins", path: "/a" },
            { group: "invites", path: "/user/disable" },
            { group: "invites", path: "" },
            { group: "invites", path: "/users/2" },
        ];
        // TODO: ideally we'd like to see this
        // const expectedResult = [
        //   { group: "admins", path: "/a" },
        //   { group: "admins", path: "/b" },
        //   { group: "admins", path: "/" },
        //   { group: "admins", path: "/:id" },
        //   { group: "invites", path: "/user/disable" },
        //   { group: "invites", path: "/users/2" },
        //   { group: "invites", path: "/users" },
        //   { group: "invites", path: "/" },
        //   { group: "invites", path: "" },
        //   { group: "invites", path: "/:inviteId" },
        //   { group: "users", path: "/deleted" },
        //   { group: "users", path: "/" },
        //   { group: "users", path: "/:id" },
        // ];
        const expectedResult = [
            { group: "admins", path: "/" },
            { group: "admins", path: "/a" },
            { group: "admins", path: "/b" },
            { group: "admins", path: "/:id" },
            { group: "invites", path: "/user/disable" },
            { group: "invites", path: "/users/2" },
            { group: "invites", path: "" },
            { group: "invites", path: "/" },
            { group: "invites", path: "/users" },
            { group: "invites", path: "/:inviteId" },
            { group: "users", path: "/" },
            { group: "users", path: "/deleted" },
            { group: "users", path: "/:id" },
        ];
        // test provided order
        const sortA = [...routes];
        index_1.sortRoutes(sortA);
        // console.log("EXPECTED", JSON.stringify(expectedResult, null, "  "));
        // console.log("RESULT A", JSON.stringify(sortA, null, "  "));
        expect(sortA).toEqual(expectedResult);
        // test with inverted input
        const sortB = [...routes].reverse();
        index_1.sortRoutes(sortB);
        expect(sortB).toEqual(expectedResult);
    }));
});
// these tests initiate their own app
describe("express-schema-server", () => {
    it("should accept optional logger", () => __awaiter(void 0, void 0, void 0, function* () {
        const myLogger = {
            trace: jest.fn(),
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };
        app = supertest(yield app_1.default({
            log: myLogger,
        }));
        // @ts-ignore
        expect(myLogger.info.mock.calls).toMatchSnapshot();
    }));
    it("should accept and apply optional simulated latency", () => __awaiter(void 0, void 0, void 0, function* () {
        app = supertest(yield app_1.default({
            simulatedLatency: 100,
        }));
        const startTime = Date.now();
        const getResponse = yield app.get("/users").send();
        const timeTaken = Date.now() - startTime;
        expect(getResponse.status).toEqual(HttpStatus.OK);
        expect(getResponse.body).toMatchSnapshot();
        expect(timeTaken).toBeGreaterThanOrEqual(100);
    }));
});
//# sourceMappingURL=index.test.js.map