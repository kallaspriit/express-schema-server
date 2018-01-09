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
            minLength: 3
        }
    },
    required: ["name"]
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
            format: "throws-error"
        }
    },
    required: ["name"]
};
function validateThrowsError() {
    return {
        name: "throws-error",
        validate: (_value) => __awaiter(this, void 0, void 0, function* () {
            throw new Error("Validator error message");
        })
    };
}
describe("express-schema-server", () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        app = supertest(yield app_1.default());
    }));
    it("provides schema endpoint for all endpoints", () => __awaiter(this, void 0, void 0, function* () {
        const getResponse = yield app.get(`/schema`).send();
        expect(getResponse.status).toEqual(200);
        expect(getResponse.body).toMatchSnapshot();
    }));
    it("provides schema endpoint for specific endpoints", () => __awaiter(this, void 0, void 0, function* () {
        const getResponse = yield app.get(`/schema/users/post`).send();
        expect(getResponse.status).toEqual(200);
        expect(getResponse.body).toMatchSnapshot();
    }));
    it("performs valid json schema validation", () => __awaiter(this, void 0, void 0, function* () {
        const data = {
            name: "Jack Daniels"
        };
        const validationResult = yield index_1.validateJsonSchema(data, normalSchema);
        expect(validationResult).toMatchSnapshot();
    }));
    it("performs invalid json schema validation", () => __awaiter(this, void 0, void 0, function* () {
        const data = {
            name: "J" // too short
        };
        const validationResult = yield index_1.validateJsonSchema(data, normalSchema);
        expect(validationResult).toMatchSnapshot();
    }));
    it("schema validation fails if missing validator", () => __awaiter(this, void 0, void 0, function* () {
        const data = {
            name: "Jack Daniels"
        };
        const validationResult = yield index_1.validateJsonSchema(data, errorSchema, [validateThrowsError()]);
        expect(validationResult).toMatchSnapshot();
    }));
    it("provides detailed error class", () => __awaiter(this, void 0, void 0, function* () {
        const error = new index_1.DetailedError("Message", { foo: "bar" });
        expect(error).toMatchSnapshot();
    }));
    it("provides detailed error class, details are optional", () => __awaiter(this, void 0, void 0, function* () {
        const error = new index_1.DetailedError("Message");
        expect(error).toMatchSnapshot();
    }));
    it("provides helper for pagination page options", () => __awaiter(this, void 0, void 0, function* () {
        const options = index_1.getPaginationPageOptions({
            page: "2",
            itemsPerPage: "5"
        });
        expect(options).toMatchSnapshot();
    }));
    it("provides helper for pagination page options, one can specify default items per page", () => __awaiter(this, void 0, void 0, function* () {
        const options = index_1.getPaginationPageOptions({
            page: "2",
            itemsPerPage: "5"
        }, 5);
        expect(options).toMatchSnapshot();
    }));
    it("provides helper for combining messages", () => __awaiter(this, void 0, void 0, function* () {
        const message1 = index_1.combineMessages([]);
        const message2 = index_1.combineMessages(["Test1"]);
        const message3 = index_1.combineMessages(["Test1", "Test2"]);
        const message4 = index_1.combineMessages(["Test1", "Test2", "Test3"]);
        expect(message1).toMatchSnapshot();
        expect(message2).toMatchSnapshot();
        expect(message3).toMatchSnapshot();
        expect(message4).toMatchSnapshot();
    }));
});
//# sourceMappingURL=index.test.js.map