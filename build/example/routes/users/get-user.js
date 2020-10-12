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
exports.responseSchema = exports.requestSchema = void 0;
const HttpStatus = require("http-status-codes");
const normalize_type_1 = require("normalize-type");
const __1 = require("../../../");
const user_schema_1 = require("../../schemas/user-schema");
exports.requestSchema = {
    title: "Get user parameters",
    description: "Parameters for getting user info",
    type: "object",
    properties: {
        id: {
            title: "Id",
            description: "User id",
            type: "number",
            minimum: 1,
        },
    },
    required: ["id"],
};
exports.responseSchema = __1.buildResponseSchema(user_schema_1.default);
exports.default = () => ({
    path: "/:id",
    method: "get",
    metadata: {
        title: "Get user info",
        description: "Returns registered user info by email",
        sinceVersion: "1.0.0",
        isDeprecated: false,
    },
    requestSchema: exports.requestSchema,
    responseSchema: exports.responseSchema,
    handler: (request, response, _next) => __awaiter(void 0, void 0, void 0, function* () {
        const requestData = normalize_type_1.normalizeType(request.params);
        const validationResult = yield __1.validateJsonSchema(requestData, exports.requestSchema);
        if (!validationResult.isValid) {
            response.fail(validationResult.errors, exports.responseSchema);
            return;
        }
        const user = yield request.db.user.getById(requestData.id);
        if (!user) {
            response.status(HttpStatus.NOT_FOUND).send(`User with id "${requestData.id}" could not be found`);
            return;
        }
        response.success(user, exports.responseSchema);
    }),
});
//# sourceMappingURL=get-user.js.map