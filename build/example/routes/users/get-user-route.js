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
exports.requestSchema = {
    title: 'Get user parameters',
    description: 'Parameters for getting user info',
    type: 'object',
    properties: {
        id: {
            type: 'number',
            title: 'Id',
            description: 'User id',
            minimum: 1,
        },
    },
    required: ['id'],
};
exports.responseSchema = _1.buildResponseSchema({
    title: 'User info',
    description: 'Registered user info',
    type: 'object',
    properties: {
        id: {
            type: 'number',
            title: 'Id',
            description: 'User id',
            minimum: 1,
        },
        name: {
            type: 'string',
            title: 'Name',
            description: 'User name',
            minLength: 3,
            maxLength: 100,
        },
        email: {
            type: 'string',
            title: 'Email',
            description: 'Email address',
            minLength: 3,
            maxLength: 256,
            format: 'email',
        },
    },
    required: ['name', 'email'],
});
exports.default = () => ({
    path: '/:id',
    method: 'get',
    metadata: {
        title: 'Get user info',
        description: 'Returns registered user info by email',
        sinceVersion: '1.0.0',
        isDeprecated: false,
    },
    requestSchema: exports.requestSchema,
    responseSchema: exports.responseSchema,
    handler: (request, response, _next) => __awaiter(this, void 0, void 0, function* () {
        const requestData = normalize_type_1.normalizeType(request.params);
        const validationResult = yield _1.validateJsonSchema(requestData, exports.requestSchema);
        if (!validationResult.isValid) {
            response.fail(validationResult.errors, exports.responseSchema);
            return;
        }
        const user = yield request.db.user.getById(requestData.id);
        if (!user) {
            response.status(404).send(`User with id "${requestData.id}" could not be found`);
            return;
        }
        response.success(user, exports.responseSchema);
    }),
});
//# sourceMappingURL=get-user-route.js.map