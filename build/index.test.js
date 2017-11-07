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
    title: 'Test schema',
    description: 'Testing JSON schema',
    type: 'object',
    properties: {
        name: {
            title: 'Name',
            description: 'User name',
            type: 'string',
            minLength: 3,
        },
    },
    required: ['name'],
};
const errorSchema = {
    title: 'Test schema',
    description: 'Testing JSON schema',
    type: 'object',
    properties: {
        name: {
            title: 'Name',
            description: 'User name',
            type: 'string',
            minLength: 3,
            format: 'throws-error',
        },
    },
    required: ['name'],
};
function validateThrowsError() {
    return {
        name: 'throws-error',
        validate: (_value) => __awaiter(this, void 0, void 0, function* () {
            throw new Error('Validator error message');
        }),
    };
}
describe('get-user-route', () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        app = supertest(yield app_1.default());
    }));
    it('provides schema endpoint', () => __awaiter(this, void 0, void 0, function* () {
        const getResponse = yield app.get(`/schema`).send();
        expect(getResponse.status).toEqual(200);
        expect(getResponse.body.text).toMatchSnapshot();
    }));
    it('performs valid json schema validation', () => __awaiter(this, void 0, void 0, function* () {
        const data = {
            name: 'Jack Daniels',
        };
        const validationResult = yield index_1.validateJsonSchema(data, normalSchema);
        expect(validationResult).toMatchSnapshot();
    }));
    it('performs invalid json schema validation', () => __awaiter(this, void 0, void 0, function* () {
        const data = {
            name: 'J',
        };
        const validationResult = yield index_1.validateJsonSchema(data, normalSchema);
        expect(validationResult).toMatchSnapshot();
    }));
    it('schema validation fails if missing validator', () => __awaiter(this, void 0, void 0, function* () {
        const data = {
            name: 'Jack Daniels',
        };
        const validationResult = yield index_1.validateJsonSchema(data, errorSchema, [validateThrowsError()]);
        expect(validationResult).toMatchSnapshot();
    }));
});
//# sourceMappingURL=index.test.js.map