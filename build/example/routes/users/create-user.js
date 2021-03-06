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
const normalize_type_1 = require("normalize-type");
const __1 = require("../../../");
const user_schema_1 = require("../../schemas/user-schema");
const validateUniqueEmail_1 = require("../../validators/validateUniqueEmail");
exports.requestSchema = {
    title: "Create user",
    description: "Create a new user account",
    type: "object",
    properties: {
        name: {
            type: "string",
            title: "Name",
            description: "User name",
            minLength: 3,
            maxLength: 100,
        },
        email: {
            type: "string",
            title: "Email",
            description: "Email address",
            minLength: 3,
            maxLength: 256,
            allOf: [
                {
                    format: "email",
                },
                {
                    format: "unique-email",
                },
            ],
        },
    },
    required: ["name", "email"],
};
exports.responseSchema = __1.buildResponseSchema(user_schema_1.default);
exports.default = () => ({
    path: "",
    method: "post",
    metadata: {
        title: "Register user",
        description: "Register a new user account",
        sinceVersion: "1.0.0",
        isDeprecated: false,
    },
    requestSchema: exports.requestSchema,
    responseSchema: exports.responseSchema,
    handler: (request, response, _next) => __awaiter(void 0, void 0, void 0, function* () {
        const requestData = normalize_type_1.normalizeType(request.body);
        const validators = [validateUniqueEmail_1.default(request.db.user)];
        const validationResult = yield __1.validateJsonSchema(requestData, exports.requestSchema, validators);
        if (!validationResult.isValid) {
            response.fail(validationResult.errors, exports.responseSchema, validators);
            return;
        }
        const user = yield request.db.user.save(requestData);
        response.created(user, exports.responseSchema, validators);
    }),
});
//# sourceMappingURL=create-user.js.map