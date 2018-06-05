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
const user_schema_1 = require("../../schemas/user-schema");
exports.responseSchema = __1.buildPaginatedResponseSchema({
    title: "Users",
    description: "List of paginated users",
    type: "array",
    items: user_schema_1.default,
});
exports.default = () => ({
    path: "",
    method: "get",
    metadata: {
        title: "Get users",
        description: "Returns list of paginated users",
        sinceVersion: "1.0.0",
        isDeprecated: false,
    },
    requestSchema: __1.paginationOptionsSchema,
    responseSchema: exports.responseSchema,
    handler: (request, response, _next) => __awaiter(this, void 0, void 0, function* () {
        const defaultItemsPerPage = 3;
        const paginationOptions = __1.getPaginationPageOptions(request.query, defaultItemsPerPage);
        const validationResult = yield __1.validateJsonSchema(paginationOptions, __1.paginationOptionsSchema);
        if (!validationResult.isValid) {
            response.fail(validationResult.errors, exports.responseSchema);
            return;
        }
        const result = yield request.db.user.getPaginated(paginationOptions);
        response.paginatedSuccess(result.items, paginationOptions, result.count, exports.responseSchema);
    }),
});
//# sourceMappingURL=get-users.js.map