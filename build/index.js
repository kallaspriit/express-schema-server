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
const express_1 = require("express");
const glob = require("glob");
const HttpStatus = require("http-status-codes");
const normalize_type_1 = require("normalize-type");
const path = require("path");
const zSchema = require("z-schema");
class DetailedError extends Error {
    constructor(message, details = null) {
        super(message);
        this.details = details;
    }
}
exports.DetailedError = DetailedError;
// tslint:disable-next-line:max-classes-per-file
class InvalidApiResponseError extends DetailedError {
    constructor(responseData, responseSchema, validationErrors) {
        super("Validating generated response against schema failed", {
            validationErrors,
            responseData,
            responseSchema,
        });
    }
}
exports.InvalidApiResponseError = InvalidApiResponseError;
exports.paginationOptionsSchema = {
    title: "Pagination options",
    description: "Paginated request options",
    type: "object",
    properties: {
        page: {
            title: "Page",
            description: "Page number",
            type: "number",
            minimum: 1,
            default: 1,
        },
        itemsPerPage: {
            title: "Items per page",
            description: "Number of items to show on a single page",
            type: "number",
            minimum: 1,
            default: 10,
        },
    },
};
function expressSchemaServer(options) {
    // create router
    const router = express_1.Router();
    // map route sources to route descriptors
    const routes = options.routes.map(routeSource => {
        // setup the route to get the route definition
        const routeDefinition = routeSource.setup();
        // build route info
        const route = Object.assign({}, routeSource, routeDefinition);
        return route;
    });
    // sort the routes in a way that routes with parameters come later
    sortRoutes(routes);
    // register dynamic routes
    routes.forEach(route => {
        // type safe method name
        const method = route.method !== undefined ? route.method : "get";
        // handler can be either a single handler function or array of handlers, treat it always as an array
        const handlers = Array.isArray(route.handler)
            ? route.handler
            : [route.handler];
        const endpoint = buildRoutePath([route.group, route.path]);
        // register the handlers
        handlers.forEach(handler => {
            router[method](endpoint, (request, response, next) => {
                handler(augmentExpressRequest(request, options.context), augmentExpressResponse(response), next);
            });
        });
        // create schema endpoint (so /group/path schema is available at GET /schema/group/path)
        if (route.group !== "") {
            const schemaPath = buildRoutePath(["schema", getRouteWithoutParameters(endpoint), method]);
            router.get(schemaPath, (request, response, _next) => {
                response.send(getRouteSchema(route, request.baseUrl));
            });
        }
    });
    // create endpoint to get the information about all routes
    router.get("/schema", schemaMiddleware(options.metadata, routes));
    return router;
}
exports.default = expressSchemaServer;
function schemaMiddleware(metadata, routes) {
    return (request, response, _next) => {
        const schema = {
            metadata,
            routes: routes.map(route => getRouteSchema(route, request.baseUrl)),
        };
        response.send(schema);
    };
}
exports.schemaMiddleware = schemaMiddleware;
function getRouteSchema(route, baseUrl) {
    const endpointPath = buildRoutePath([route.group, route.path]);
    const endpointUrl = buildRoutePath([baseUrl, endpointPath]);
    const method = route.method !== undefined ? route.method : "get";
    const schemaUrl = buildRoutePath([baseUrl, "schema", getRouteWithoutParameters(endpointPath), method]);
    const { group, name, metadata, requestSchema, responseSchema } = route;
    return {
        method,
        group,
        name,
        path: route.path,
        endpointUrl,
        schemaUrl,
        metadata,
        requestSchema: requestSchema !== undefined ? requestSchema : {},
        responseSchema: responseSchema !== undefined ? responseSchema : {},
    };
}
exports.getRouteSchema = getRouteSchema;
function buildRoutePath(components) {
    let routePath = components.reduce((combinedPath, component) => {
        if (component === "" || component === "/") {
            return combinedPath;
        }
        return `${combinedPath}/${component}`;
    }, "/");
    // remove multiple slashes
    routePath = routePath.replace(/\/{1,}/g, "/");
    // remove trailing slash
    if (routePath[routePath.length - 1] === "/") {
        routePath = routePath.substring(0, routePath.length - 1);
    }
    // use / for empty path
    if (routePath.length === 0) {
        routePath = "/";
    }
    return routePath;
}
exports.buildRoutePath = buildRoutePath;
function validateJsonSchema(data, schema, customValidators) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, _reject) => {
            // https://github.com/zaggino/z-schema#options
            const validator = new zSchema({
                // noTypeless: true,
                noExtraKeywords: true,
                forceItems: true,
                forceProperties: true,
                breakOnFirstError: false,
            });
            // register custom validators if requested
            if (Array.isArray(customValidators)) {
                customValidators.forEach(customValidator => {
                    const formatValidator = (value, validationCallback) => {
                        customValidator
                            .validate(value)
                            .then(validationCallback)
                            .catch(_e => validationCallback(false));
                    };
                    // "as.." is needed because the type definitions is missing the callback signature
                    zSchema.registerFormat(customValidator.name, formatValidator);
                });
            }
            validator.validate(data, schema, (errors, isValid) => {
                // unregister added validators
                if (Array.isArray(customValidators)) {
                    customValidators.forEach(customValidator => {
                        zSchema.unregisterFormat(customValidator.name);
                    });
                }
                resolve({
                    isValid,
                    errors: Array.isArray(errors) ? errors : [],
                });
            });
        });
    });
}
exports.validateJsonSchema = validateJsonSchema;
function buildResponseSchema(payloadSchema) {
    return {
        title: "Response schema",
        description: "Standard response schema envelope",
        type: "object",
        properties: {
            payload: {
                oneOf: [
                    {
                        type: "null",
                    },
                    payloadSchema,
                ],
            },
            success: {
                title: "Success indicator",
                description: "This is true if processing the request was successful and false if there were any issues",
                type: "boolean",
            },
            error: {
                title: "Error message",
                description: "Combined human-readable error message",
                oneOf: [
                    {
                        type: "null",
                    },
                    {
                        title: "Error message",
                        description: "Combined human-readable error message",
                        type: "string",
                    },
                ],
            },
            validationErrors: {
                title: "Validation errors",
                description: "List of validation errors (empty array if there were none)",
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        message: {
                            title: "Message",
                            description: "Validation error message",
                            type: "string",
                        },
                        code: {
                            title: "Error code",
                            description: "Validation error code",
                            type: "string",
                        },
                        params: {
                            title: "Error parameters",
                            description: "Validation error parameters",
                            type: "array",
                            items: {
                                oneOf: [
                                    {
                                        type: "null",
                                    },
                                    {
                                        type: "string",
                                    },
                                    {
                                        type: "number",
                                    },
                                ],
                            },
                        },
                        path: {
                            title: "Error path",
                            description: "JSON path to the input parameter that failed the validation",
                            type: "string",
                        },
                        description: {
                            title: "Parameter description",
                            description: "Failed input parameter description",
                            type: "string",
                        },
                    },
                    required: ["message", "code", "params", "path"],
                },
            },
        },
        required: ["payload", "success", "error", "validationErrors"],
    };
}
exports.buildResponseSchema = buildResponseSchema;
function buildPaginatedResponseSchema(payloadSchema, maximumItemsPerPage = 100) {
    return buildResponseSchema({
        title: `${payloadSchema.title} (paginated)`,
        description: payloadSchema.description,
        type: "object",
        properties: {
            items: payloadSchema,
            itemCount: {
                title: "Item count",
                description: "Total number of items",
                type: "number",
                minimum: 0,
            },
            page: {
                title: "Page",
                description: "Current page number",
                type: "number",
                minimum: 1,
            },
            pageCount: {
                title: "Page count",
                description: "Total number of pages",
                type: "number",
                minimum: 0,
            },
            itemsPerPage: {
                title: "Items per page",
                description: "Number of items on each page",
                type: "number",
                minimum: 1,
                maximum: maximumItemsPerPage,
            },
        },
        required: ["items", "itemCount", "page", "pageCount", "itemsPerPage"],
    });
}
exports.buildPaginatedResponseSchema = buildPaginatedResponseSchema;
function getRoutes(baseDirectory, filePattern = "**/!(*.spec|*.test|*.d).+(js|ts)") {
    return __awaiter(this, void 0, void 0, function* () {
        const globPattern = path.join(baseDirectory, filePattern);
        return new Promise((resolve, reject) => {
            glob(globPattern, (error, filenames) => {
                /* istanbul ignore if */
                if (error !== null) {
                    reject(error);
                    return;
                }
                const routes = filenames.map(filename => ({
                    group: getRouteGroup(filename, baseDirectory),
                    name: getRouteName(filename),
                    filename,
                    setup: () => {
                        const routeSetupFn = require(filename).default;
                        /* istanbul ignore if */
                        // tslint:disable-next-line:strict-type-predicates
                        if (typeof routeSetupFn !== "function") {
                            throw new Error(`Export of route "${getRouteName(filename)}" in "${filename}" is expected to be a function but got ${typeof routeSetupFn}`);
                        }
                        const routeDefinition = routeSetupFn();
                        return routeDefinition;
                    },
                }));
                resolve(routes);
            });
        });
    });
}
exports.getRoutes = getRoutes;
function sortRoutes(routes) {
    // sortBy(routes, ["group", "path"]);
    routes
        // sort by number of parameters and path
        .sort((routeA, routeB) => {
        const parameterCountA = routeA.path.split(":").length - 1;
        const parameterCountB = routeB.path.split(":").length - 1;
        const parameterResult = parameterCountA > parameterCountB ? 1 : parameterCountA < parameterCountB ? -1 : 0;
        // sort by parameter count if not the same
        if (parameterResult !== 0) {
            return parameterResult;
        }
        // sort by path name if the parameter count is the same
        return routeA.path.localeCompare(routeB.path);
    })
        // then sort by group name
        .sort((routeA, routeB) => routeA.group.localeCompare(routeB.group));
}
exports.sortRoutes = sortRoutes;
function getPaginationPageOptions(query, defaultItemsPerPage = 10) {
    const options = normalize_type_1.default(query);
    return {
        page: options.page !== undefined ? options.page : 1,
        itemsPerPage: options.itemsPerPage !== undefined ? options.itemsPerPage : defaultItemsPerPage,
    };
}
exports.getPaginationPageOptions = getPaginationPageOptions;
/* istanbul ignore next */
function formatJsonPath(jsonPath) {
    if (jsonPath.substring(0, 2) === "#/") {
        return jsonPath.substring(2);
    }
    return jsonPath;
}
function lowerCaseFirst(message) {
    /* istanbul ignore if */
    if (message.length < 2) {
        return message;
    }
    return `${message.substring(0, 1).toLowerCase()}${message.substring(1)}`;
}
function combineMessages(messages) {
    const messageCount = messages.length;
    switch (messageCount) {
        /* istanbul ignore next */
        case 0:
            return "";
        case 1:
            return messages[0];
        case 2:
            return `${messages[0]} and ${messages[1]}`;
        default: {
            const firstMessages = messages.slice(0, messageCount - 1);
            const lastMessage = messages[messageCount - 1];
            return `${firstMessages.join(", ")} and ${lastMessage}`;
        }
    }
}
exports.combineMessages = combineMessages;
function buildErrorMessage(validationErrors) {
    const messages = validationErrors.map(error => {
        const formattedPath = formatJsonPath(error.path);
        return `${formattedPath.length > 0 ? `${formattedPath}: ` : ""}${lowerCaseFirst(error.message)}`;
    });
    const message = combineMessages(messages);
    return `Validation failed: ${message}`;
}
function augmentExpressRequest(request, context) {
    // tslint:disable-next-line prefer-object-spread
    return Object.assign(request, context);
}
function augmentExpressResponse(response) {
    const success = (payload, responseSchema, customValidators, status = HttpStatus.OK) => __awaiter(this, void 0, void 0, function* () {
        const responseData = {
            payload,
            success: true,
            error: null,
            validationErrors: [],
        };
        const schemaValidationResult = yield validateJsonSchema(responseData, responseSchema, customValidators);
        if (!schemaValidationResult.isValid) {
            // throw new InvalidApiResponseError(responseData, responseSchema, schemaValidationResult.errors);
            const error = new InvalidApiResponseError(responseData, responseSchema, schemaValidationResult.errors);
            const errorResponseData = {
                payload: null,
                success: false,
                error: error.message,
                responseData,
                validationErrors: schemaValidationResult.errors,
                responseSchema,
            };
            response.status(HttpStatus.BAD_REQUEST).send(errorResponseData);
            return;
        }
        response.status(status).send(responseData);
    });
    // tslint:disable-next-line prefer-object-spread
    return Object.assign(response, {
        success: (payload, responseSchema, customValidators) => __awaiter(this, void 0, void 0, function* () { return success(payload, responseSchema, customValidators, HttpStatus.OK); }),
        created: (payload, responseSchema, customValidators) => __awaiter(this, void 0, void 0, function* () { return success(payload, responseSchema, customValidators, HttpStatus.CREATED); }),
        paginatedSuccess: (items, paginationOptions, itemCount, responseSchema, customValidators) => __awaiter(this, void 0, void 0, function* () {
            const payload = {
                items,
                itemCount,
                page: paginationOptions.page,
                pageCount: Math.ceil(itemCount / paginationOptions.itemsPerPage),
                itemsPerPage: paginationOptions.itemsPerPage,
            };
            yield success(payload, responseSchema, customValidators, HttpStatus.OK);
        }),
        fail: (validationErrors, responseSchema, customValidators, customErrorMessage) => __awaiter(this, void 0, void 0, function* () {
            const responseData = {
                payload: null,
                success: false,
                error: customErrorMessage !== undefined ? customErrorMessage : buildErrorMessage(validationErrors),
                validationErrors,
            };
            const schemaValidationResult = yield validateJsonSchema(responseData, responseSchema, customValidators);
            /* istanbul ignore if */
            if (!schemaValidationResult.isValid) {
                const error = new InvalidApiResponseError(responseData, responseSchema, schemaValidationResult.errors);
                const errorResponseData = {
                    payload: null,
                    success: false,
                    error: error.message,
                    responseData,
                    validationErrors: schemaValidationResult.errors,
                    responseSchema,
                };
                response.status(HttpStatus.BAD_REQUEST).send(errorResponseData);
                return;
            }
            response.status(HttpStatus.BAD_REQUEST).send(responseData);
        }),
    });
}
function getRouteGroup(filename, baseDirectory) {
    const relativePath = path.relative(baseDirectory, filename);
    const basename = path.basename(relativePath);
    return path.basename(relativePath.substring(0, relativePath.length - basename.length - 1));
}
function getRouteName(filename) {
    return path.basename(filename, path.extname(filename));
}
function getRouteWithoutParameters(route) {
    const tokens = route.split(/\//);
    return tokens.filter(token => token.substring(0, 1) !== ":").join("/");
}
//# sourceMappingURL=index.js.map