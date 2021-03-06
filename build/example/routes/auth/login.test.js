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
describe("authentication", () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        app = supertest(yield app_1.default());
    }));
    it("should return logged in user message", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield app.get("/auth/login").auth("jack", "daniels").send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.success).toBe(true);
        expect(response.body.payload).toMatchSnapshot();
    }));
});
//# sourceMappingURL=login.test.js.map