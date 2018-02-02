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
const index_1 = require("./index");
// returns valid password for foobar, false otherwise
const validPassword = "foobar";
const validEmail = "foo@bar.com";
const validatePassword = {
    name: "valid-password",
    validate: (password) => __awaiter(this, void 0, void 0, function* () { return password === validPassword; })
};
const schema = {
    title: "Login",
    description: "Authenticate with username and password",
    type: "object",
    properties: {
        email: {
            type: "string",
            title: "Email",
            description: "Email address",
            minLength: 3,
            maxLength: 256,
            format: "email"
        },
        password: {
            type: "string",
            title: "Password",
            description: "Account password",
            minLength: 6,
            maxLength: 256,
            format: "valid-password"
        }
    },
    required: ["email", "password"]
};
const validators = [validatePassword];
// tslint:disable:no-magic-numbers
describe("express-schema-server", () => {
    it("validates json schema using both built-in and custom validators", () => __awaiter(this, void 0, void 0, function* () {
        const data = {
            email: validEmail,
            password: validPassword
        };
        const result = yield index_1.validateJsonSchema(data, schema, validators);
        expect(result.isValid).toEqual(true);
    }));
    it("reports missing fields", () => __awaiter(this, void 0, void 0, function* () {
        const data = {
            email: validEmail
        };
        const result = yield index_1.validateJsonSchema(data, schema, validators);
        expect(result.isValid).toEqual(false);
        expect(result.errors.length).toEqual(1);
        expect(result.errors).toMatchSnapshot();
    }));
    it("reports all issues", () => __awaiter(this, void 0, void 0, function* () {
        const data = {
            email: "",
            password: ""
        };
        const result = yield index_1.validateJsonSchema(data, schema, validators);
        expect(result.isValid).toEqual(false);
        expect(result.errors.length).toEqual(3);
        expect(result.errors).toMatchSnapshot();
    }));
    it("reports invalid custom validator", () => __awaiter(this, void 0, void 0, function* () {
        const data = {
            email: validEmail,
            password: "xxxxxx"
        };
        const result = yield index_1.validateJsonSchema(data, schema, validators);
        expect(result.isValid).toEqual(false);
        expect(result.errors.length).toEqual(1);
        expect(result.errors).toMatchSnapshot();
    }));
    it("reports built in validator along with custom custom validator", () => __awaiter(this, void 0, void 0, function* () {
        const data = {
            email: "yyy",
            password: "xxx"
        };
        const result = yield index_1.validateJsonSchema(data, schema, validators);
        expect(result.isValid).toEqual(false);
        expect(result.errors.length).toEqual(2);
        expect(result.errors).toMatchSnapshot();
    }));
});
//# sourceMappingURL=validateSchema.test.js.map