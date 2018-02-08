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
exports.default = () => ({
    path: "/custom-error",
    method: "get",
    metadata: {
        title: "Custom error",
        description: "Returns failure with custom error",
        sinceVersion: "1.0.0",
        isDeprecated: false,
    },
    requestSchema: {},
    responseSchema: {},
    handler: (_request, response, _next) => __awaiter(this, void 0, void 0, function* () {
        response.fail([], {}, [], "Custom error message");
    }),
});
//# sourceMappingURL=custom-error.js.map