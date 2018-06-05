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
const __1 = require("../../../");
exports.responseSchema = __1.buildResponseSchema({
    type: "object",
    properties: {
        id: {
            type: "number",
        },
    },
});
exports.default = () => ({
    path: "/invalid-success",
    method: "get",
    metadata: {
        title: "Get user info",
        description: "Returns registered user info by email",
        sinceVersion: "1.0.0",
        isDeprecated: false,
    },
    requestSchema: {},
    responseSchema: exports.responseSchema,
    handler: (_request, response, _next) => __awaiter(this, void 0, void 0, function* () {
        response.success({
            id: "not a number",
        }, exports.responseSchema);
    }),
});
//# sourceMappingURL=invalid-success.js.map