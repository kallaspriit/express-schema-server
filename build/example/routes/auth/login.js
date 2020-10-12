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
exports.responseSchema = void 0;
const HttpStatus = require("http-status-codes");
const __1 = require("../../../");
const User_1 = require("../../models/User");
exports.responseSchema = __1.buildResponseSchema({
    type: "object",
    properties: {
        message: {
            type: "string",
        },
    },
});
exports.default = () => ({
    path: "/login",
    method: "get",
    metadata: {
        title: "Get user info",
        description: "Returns registered user info by email",
        sinceVersion: "1.0.0",
        isDeprecated: false,
    },
    requestSchema: {},
    responseSchema: exports.responseSchema,
    // handler can be an array of handlers
    handler: [
        // additional middlewares could perform authentication etc
        (request, _response, next) => {
            // use basic auth etc to login the user
            // console.log('authorization', request.headers.authorization);
            request.loggedInUser = new User_1.default("Jack Daniels", "jack@daniels.com");
            next();
        },
        (request, response, _next) => __awaiter(void 0, void 0, void 0, function* () {
            /* istanbul ignore if */
            if (!request.loggedInUser) {
                response.status(HttpStatus.UNAUTHORIZED).send("You need to be logged in to access this resource");
                return;
            }
            response.success({
                message: `Hello ${request.loggedInUser.name}`,
            }, exports.responseSchema);
        }),
    ],
});
//# sourceMappingURL=login.js.map