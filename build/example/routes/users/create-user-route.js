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
const normalize_type_1 = require("normalize-type");
const _1 = require("../../../");
const validateUniqueEmail_1 = require("../../validators/validateUniqueEmail");
const users_1 = require("./users");
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
            maxLength: 100
        },
        email: {
            type: "string",
            title: "Email",
            description: "Email address",
            minLength: 3,
            maxLength: 256,
            allOf: [
                {
                    format: "email"
                },
                {
                    format: "unique-email"
                }
            ]
        }
    },
    required: ["name", "email"]
};
exports.responseSchema = _1.buildResponseSchema(users_1.userSchema);
exports.default = () => ({
    path: "",
    method: "post",
    metadata: {
        title: "Register user",
        description: "Register a new user account",
        sinceVersion: "1.0.0",
        isDeprecated: false
    },
    requestSchema: exports.requestSchema,
    responseSchema: exports.responseSchema,
    handler: (request, response, _next) => __awaiter(this, void 0, void 0, function* () {
        const requestData = normalize_type_1.normalizeType(request.body);
        const validators = [validateUniqueEmail_1.default(request.db.user)];
        const validationResult = yield _1.validateJsonSchema(requestData, exports.requestSchema, validators);
        if (!validationResult.isValid) {
            response.fail(validationResult.errors, exports.responseSchema, validators);
            return;
        }
        const user = yield request.db.user.save(requestData);
        response.success(users_1.transformUser(user), exports.responseSchema, validators);
    })
});
//# sourceMappingURL=create-user-route.js.map