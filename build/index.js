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
exports.paginationOptionsSchema = {
    title: 'Pagination options',
    description: 'Paginated request options',
    type: 'object',
    properties: {
        page: {
            title: 'Page',
            description: 'Page number',
            type: 'number',
            minimum: 1,
            default: 1,
        },
        itemsPerPage: {
            title: 'Items per page',
            description: 'Number of items to show on a single page',
            type: 'number',
            minimum: 1,
            default: 10,
        },
    },
};
function jsonSchemaServerMiddleware(options) {
    const router = express_1.Router();
    let routes = [];
    // register dynamic routes
    options.routes.forEach(route => {
        // setup the route to get the route definition
        const routeDefinition = route.setup();
        const endpoint = buildRoutePath([route.group, routeDefinition.path]);
        // initialize routes if not already present
        if (options.context.routes === undefined) {
            options.context.routes = [];
        }
        routes = options.context.routes;
        // register the route info
        const routeInfo = Object.assign({}, route, routeDefinition, { endpoint });
        options.context.routes.push(routeInfo);
        // type safe method name
        const appMethodName = routeDefinition.method;
        // handler can be either a single handler function or array of handlers, treat it always as an array
        const handlers = Array.isArray(routeDefinition.handler)
            ? routeDefinition.handler
            : [routeDefinition.handler];
        // register the handlers
        handlers.forEach(handler => {
            router[appMethodName](endpoint, (request, response, next) => {
                handler(augmentExpressRequest(request, options.context), augmentExpressResponse(response), next);
            });
        });
        // create schema endpoint (so /group/path schema is available at GET /schema/group/path)
        if (route.group !== '') {
            const schemaPath = buildRoutePath(['schema', getRouteWithoutParameters(endpoint), routeDefinition.method]);
            router.get(schemaPath, (_request, response, _next) => {
                response.send({
                    request: routeDefinition.requestSchema,
                    response: routeDefinition.responseSchema,
                });
            });
        }
    });
    // create endpoint to get the information about all routes
    router.get('/schema', schemaMiddleware(options.metadata, routes));
    return router;
}
exports.default = jsonSchemaServerMiddleware;
function schemaMiddleware(metadata, routes) {
    return (request, response, _next) => {
        response.send({
            metadata,
            routes: routes.map(route => getRouteSchema(route, request.baseUrl)),
        });
    };
}
exports.schemaMiddleware = schemaMiddleware;
function getRouteSchema(route, baseUrl) {
    const endpointUrl = buildRoutePath([route.group, route.path]);
    return {
        group: route.group,
        path: route.path,
        method: route.method,
        endpointUrl: `${baseUrl}${endpointUrl}`,
        schemaUrl: buildRoutePath([baseUrl, 'schema', getRouteWithoutParameters(endpointUrl), route.method]),
        metadata: route.metadata,
        requestSchema: route.requestSchema,
        responseSchema: route.responseSchema,
    };
}
exports.getRouteSchema = getRouteSchema;
function buildRoutePath(components) {
    let routePath = components.reduce((combinedPath, component) => {
        if (component === '' || component === '/') {
            return combinedPath;
        }
        return `${combinedPath}/${component}`;
    }, '/');
    // remove multiple slashes
    routePath = routePath.replace(/\/{1,}/g, '/');
    // remove trailing slash
    if (routePath[routePath.length - 1] === '/') {
        routePath = routePath.substring(0, routePath.length - 1);
    }
    // use / for empty path
    if (routePath.length === 0) {
        routePath = '/';
    }
    return routePath;
}
exports.buildRoutePath = buildRoutePath;
function validateJsonSchema(data, schema, customValidators) {
    return new Promise((resolve, _reject) => {
        // https://github.com/zaggino/z-schema#options
        const validator = new zSchema({
            // noTypeless: true,
            noExtraKeywords: true,
            forceItems: true,
            forceProperties: true,
        });
        // register custom validators if requested
        if (Array.isArray(customValidators)) {
            customValidators.forEach(customValidator => {
                const formatValidator = (value, validationCallback) => {
                    customValidator
                        .validate(value)
                        .then(isValid => validationCallback(isValid))
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
                errors: errors || [],
            });
        });
    });
}
exports.validateJsonSchema = validateJsonSchema;
function buildResponseSchema(payloadSchema) {
    return {
        title: 'Response schema',
        description: 'Standard response schema envelope',
        type: 'object',
        properties: {
            payload: {
                oneOf: [
                    {
                        type: 'null',
                    },
                    payloadSchema,
                ],
            },
            success: {
                title: 'Success indicator',
                description: 'This is true if processing the request was successful and false if there were any issues',
                type: 'boolean',
            },
            error: {
                title: 'Error message',
                description: 'Combined human-readable error message',
                oneOf: [
                    {
                        type: 'null',
                    },
                    {
                        title: 'Error message',
                        description: 'Combined human-readable error message',
                        type: 'string',
                    },
                ],
            },
            validationErrors: {
                title: 'Validation errors',
                description: 'List of validation errors (empty array if there were none)',
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        message: {
                            title: 'Message',
                            description: 'Validation error message',
                            type: 'string',
                        },
                        code: {
                            title: 'Error code',
                            description: 'Validation error code',
                            type: 'string',
                        },
                        params: {
                            title: 'Error parameters',
                            description: 'Validation error parameters',
                            type: 'array',
                            items: {
                                oneOf: [
                                    {
                                        type: 'null',
                                    },
                                    {
                                        type: 'string',
                                    },
                                    {
                                        type: 'number',
                                    },
                                ],
                            },
                        },
                        path: {
                            title: 'Error path',
                            description: 'JSON path to the input parameter that failed the validation',
                            type: 'string',
                        },
                        description: {
                            title: 'Parameter description',
                            description: 'Failed input parameter description',
                            type: 'string',
                        },
                    },
                    required: ['message', 'code', 'params', 'path'],
                },
            },
        },
        required: ['payload', 'success', 'error', 'validationErrors'],
    };
}
exports.buildResponseSchema = buildResponseSchema;
function buildPaginatedResponseSchema(payloadSchema, maximumItemsPerPage = 100) {
    return buildResponseSchema({
        title: `${payloadSchema.title} (paginated)`,
        description: payloadSchema.description,
        type: 'object',
        properties: {
            items: payloadSchema,
            itemCount: {
                title: 'Item count',
                description: 'Total number of items',
                type: 'number',
                minimum: 0,
            },
            page: {
                title: 'Page',
                description: 'Current page number',
                type: 'number',
                minimum: 1,
            },
            pageCount: {
                title: 'Page count',
                description: 'Total number of pages',
                type: 'number',
                minimum: 0,
            },
            itemsPerPage: {
                title: 'Items per page',
                description: 'Number of items on each page',
                type: 'number',
                minimum: 1,
                maximum: maximumItemsPerPage,
            },
        },
        required: ['items', 'itemCount', 'page', 'pageCount', 'itemsPerPage'],
    });
}
exports.buildPaginatedResponseSchema = buildPaginatedResponseSchema;
function getRoutes(baseDirectory) {
    return __awaiter(this, void 0, void 0, function* () {
        const pattern = path.join(baseDirectory, '**', '*-route!(*.spec|*.test).+(js|ts)');
        return new Promise((resolve, reject) => {
            glob(pattern, (error, matches) => {
                if (error) {
                    reject(error);
                    return;
                }
                const routes = matches.map(match => ({
                    group: getRouteGroup(match, baseDirectory),
                    name: getRouteName(match),
                    filename: match,
                    setup: () => {
                        const routeSetupFn = require(match).default;
                        if (typeof routeSetupFn !== 'function') {
                            throw new Error(`Export of route "${getRouteName(match)}" in "${match}" is expected to be a function but got ${typeof routeSetupFn}`);
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
function getPaginationPageOptions(query) {
    const options = normalize_type_1.default(query);
    return {
        page: options.page || 1,
        itemsPerPage: options.itemsPerPage || 10,
    };
}
exports.getPaginationPageOptions = getPaginationPageOptions;
function getPaginationFindOptions(paginationOptions, where) {
    return {
        skip: (paginationOptions.page - 1) * paginationOptions.itemsPerPage,
        take: paginationOptions.itemsPerPage,
        where,
    };
}
exports.getPaginationFindOptions = getPaginationFindOptions;
function formatJsonPath(jsonPath) {
    if (jsonPath.substring(0, 2) === '#/') {
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
    /* istanbul ignore if */
    if (messageCount === 0) {
        return '';
    }
    else if (messageCount === 1) {
        return messages[0];
    }
    else if (messageCount === 2) {
        return `${messages[0]} and ${messages[1]}`;
    }
    else {
        const firstMessages = messages.slice(0, messageCount - 1);
        const lastMessage = messages[messageCount - 1];
        return `${firstMessages.join(', ')} and ${lastMessage}`;
    }
}
function buildErrorMessage(validationErrors) {
    const messages = validationErrors.map(error => {
        const formattedPath = formatJsonPath(error.path);
        return `${formattedPath.length > 0 ? `${formattedPath}: ` : ''}${lowerCaseFirst(error.message)}`;
    });
    const message = combineMessages(messages);
    return `Validation failed: ${message}`;
}
// tslint:disable-next-line:max-classes-per-file
class InvalidApiResponseError extends DetailedError {
    constructor(responseData, responseSchema, validationErrors) {
        super('Validating generated response against schema failed', {
            validationErrors,
            responseData,
            responseSchema,
        });
    }
}
function augmentExpressRequest(request, context) {
    // tslint:disable-next-line prefer-object-spread
    return Object.assign(request, context);
}
function augmentExpressResponse(response) {
    const success = (payload, responseSchema, customValidators) => __awaiter(this, void 0, void 0, function* () {
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
            response.status(400).send(errorResponseData);
            return errorResponseData;
        }
        response.send(responseData);
        return responseData;
    });
    // tslint:disable-next-line prefer-object-spread
    return Object.assign(response, {
        success,
        paginatedSuccess: (items, paginationOptions, itemCount, responseSchema, customValidators) => __awaiter(this, void 0, void 0, function* () {
            const payload = {
                items,
                itemCount,
                page: paginationOptions.page,
                pageCount: Math.ceil(itemCount / paginationOptions.itemsPerPage),
                itemsPerPage: paginationOptions.itemsPerPage,
            };
            return success(payload, responseSchema, customValidators);
        }),
        fail: (validationErrors, responseSchema, customValidators, customErrorMessage) => __awaiter(this, void 0, void 0, function* () {
            const responseData = {
                payload: null,
                success: false,
                error: customErrorMessage || buildErrorMessage(validationErrors),
                validationErrors,
            };
            const schemaValidationResult = yield validateJsonSchema(responseData, responseSchema, customValidators);
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
                response.status(400).send(errorResponseData);
                return errorResponseData;
            }
            response.status(400).send(responseData);
            return responseData;
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
    return tokens.filter(token => token.substring(0, 1) !== ':').join('/');
}
//# sourceMappingURL=index.js.map