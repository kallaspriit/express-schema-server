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
describe("get-user-route", () => {
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        app = supertest(yield app_1.default());
    }));
    it("should return validation error for return value not matching response schema", () => __awaiter(this, void 0, void 0, function* () {
        const response = yield app.get("/test/invalid-success").send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.success).toBe(false);
        expect(response.body.payload).toBe(null);
        expect(response.body.validationErrors).toMatchSnapshot();
    }));
});
//# sourceMappingURL=invalid-success-route.test.js.map