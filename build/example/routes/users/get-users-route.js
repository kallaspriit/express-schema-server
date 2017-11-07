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
const _1 = require("../../../");
exports.responseSchema = _1.buildPaginatedResponseSchema({
    title: 'Users',
    description: 'List of paginated users',
    items: {
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
    },
});
exports.default = () => ({
    path: '',
    method: 'get',
    metadata: {
        title: 'Get users',
        description: 'Returns list of paginated users',
        sinceVersion: '1.0.0',
        isDeprecated: false,
    },
    requestSchema: _1.paginationOptionsSchema,
    responseSchema: exports.responseSchema,
    handler: (request, response, _next) => __awaiter(this, void 0, void 0, function* () {
        const paginationOptions = _1.getPaginationPageOptions(request.query, 3);
        const validationResult = yield _1.validateJsonSchema(paginationOptions, _1.paginationOptionsSchema);
        if (!validationResult.isValid) {
            response.fail(validationResult.errors, exports.responseSchema);
            return;
        }
        const result = yield request.db.user.getPaginated(paginationOptions);
        response.paginatedSuccess(result.items, paginationOptions, result.count, exports.responseSchema);
    }),
});
//# sourceMappingURL=get-users-route.js.map