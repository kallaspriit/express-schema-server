import { Application, NextFunction, Request, RequestHandler, Response, Router } from "express";
import * as glob from "glob";
import * as HttpStatus from "http-status-codes";
import { JSONSchema4 } from "json-schema";
import normalizeType from "normalize-type";
import * as path from "path";
import { dummyLogger, Logger } from "ts-log";
import * as zSchema from "z-schema";

export { JSONSchema4 } from "json-schema";

export type RouteMethodVerb = "get" | "post" | "delete" | "put";

export interface RouteMetadata {
  title: string;
  description: string;
  sinceVersion: string;
  isDeprecated: boolean;
}

export interface RouteDefinition<Context> {
  path: string;
  handler: RouteRequestHandler<Context> | RouteRequestHandler<Context>[];
  method?: RouteMethodVerb;
  metadata?: RouteMetadata;
  requestSchema?: JSONSchema4;
  responseSchema?: JSONSchema4;
}

export interface RouteSource<Context> {
  group: string;
  name: string;
  filename: string;
  setup: RouteSetupFn<Context>;
}

export type RouteDescriptor<Context> = RouteSource<Context> & RouteDefinition<Context>;

export interface SortableRoute {
  group: string;
  path: string;
}

export interface RouteSchema {
  method: RouteMethodVerb;
  group: string;
  name: string;
  path: string;
  endpointUrl: string;
  schemaUrl: string;
  requestSchema: JSONSchema4;
  responseSchema: JSONSchema4;
  metadata?: RouteMetadata;
}

export interface SchemaMetadata {
  title: string;
  description: string;
  version: string;
}

export interface Schema {
  metadata: SchemaMetadata;
  routes: RouteSchema[];
}

export interface RouteResponsePayload<T> {
  payload: T | null;
  success: boolean;
  error: string | null;
  validationErrors: zSchema.SchemaErrorDetail[];
  [x: string]: any; // can include additional info for errors
}

export type RouteRequest<Context> = Request & Context;

export interface RouteResponse extends Response {
  success<T>(payload: T, responseSchema: JSONSchema4, customValidators?: CustomValidator[]): void;
  created<T>(payload: T, responseSchema: JSONSchema4, customValidators?: CustomValidator[]): void;
  paginatedSuccess<T>(
    items: T[],
    paginationOptions: PaginationOptions,
    itemCount: number,
    responseSchema: JSONSchema4,
    customValidators?: CustomValidator[],
  ): void;
  fail(
    validationErrors: zSchema.SchemaErrorDetail[],
    responseSchema: JSONSchema4,
    customValidators?: CustomValidator[],
    customErrorMessage?: string,
  ): void;
}

export type RouteSetupFn<Context> = () => RouteDefinition<Context>;

export type RouteRequestHandler<Context> = (
  request: RouteRequest<Context>,
  response: RouteResponse,
  next: NextFunction,
) => void;

export interface JsonSchemaValidationResult {
  isValid: boolean;
  errors: zSchema.SchemaErrorDetail[];
}

export interface JsonSchemaServerOptions<Context> {
  routes: RouteSource<Context>[];
  context: Context;
  metadata: SchemaMetadata;
  log?: Logger;
}

export interface ErrorDetails {
  [x: string]: any;
}

export type CustomValidatorFn = (value: any) => Promise<boolean>;

export interface CustomValidator {
  name: string;
  validate: CustomValidatorFn;
}

export interface PaginatedResponse<Payload> {
  items: Payload[];
  itemCount: number;
  page: number;
  pageCount: number;
  itemsPerPage: number;
}

export interface PaginationOptionsPartial {
  page?: number;
  itemsPerPage?: number;
}

export interface PaginationOptions {
  page: number;
  itemsPerPage: number;
}

export interface ObjectLiteral {
  [key: string]: any;
}

export class DetailedError extends Error {
  constructor(message: string, public details: ErrorDetails | null = null) {
    super(message);
  }
}

// tslint:disable-next-line:max-classes-per-file
export class InvalidApiResponseError extends DetailedError {
  constructor(
    responseData: RouteResponsePayload<any>,
    responseSchema: JSONSchema4,
    validationErrors: zSchema.SchemaErrorDetail[],
  ) {
    super("Validating generated response against schema failed", {
      validationErrors,
      responseData,
      responseSchema,
    });
  }
}

export const paginationOptionsSchema: JSONSchema4 = {
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

let log: Logger = dummyLogger;

export default function expressSchemaServer<TContext>(options: JsonSchemaServerOptions<TContext>): Router {
  // set logger to use if available
  /* istanbul ignore if */
  if (options.log) {
    log = options.log;
  }

  // create router
  const router = Router();

  // map route sources to route descriptors
  const routes: RouteDescriptor<TContext>[] = options.routes.map(routeSource => {
    // setup the route to get the route definition
    const routeDefinition = routeSource.setup();

    // build route info
    const route: RouteDescriptor<TContext> = {
      ...routeSource,
      ...routeDefinition,
    };

    return route;
  });

  // sort the routes in a way that routes with parameters come later
  sortRoutes(routes);

  // register dynamic routes
  routes.forEach(route => {
    // type safe method name
    const method: keyof Application = route.method !== undefined ? route.method : "get";

    // handler can be either a single handler function or array of handlers, treat it always as an array
    const handlers: RouteRequestHandler<TContext>[] = Array.isArray(route.handler) ? route.handler : [route.handler];

    const endpoint = buildRoutePath([route.group, route.path]);

    log.info("register endpoint", {
      method,
      endpoint,
    });

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
  router.get("/schema", schemaMiddleware<TContext>(options.metadata, routes));

  return router;
}

export function schemaMiddleware<Context>(
  metadata: SchemaMetadata,
  routes: RouteDescriptor<Context>[],
): RequestHandler {
  return (request: Request, response: Response, _next: NextFunction) => {
    const schema: Schema = {
      metadata,
      routes: routes.map(route => getRouteSchema(route, request.baseUrl)),
    };

    response.send(schema);
  };
}

export function getRouteSchema<Context>(route: RouteDescriptor<Context>, baseUrl: string): RouteSchema {
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

export function buildRoutePath(components: string[]): string {
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

export async function validateJsonSchema(
  data: any,
  schema: JSONSchema4,
  customValidators?: CustomValidator[],
): Promise<JsonSchemaValidationResult> {
  return new Promise<JsonSchemaValidationResult>((resolve, _reject) => {
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
        const formatValidator = (value: any, validationCallback: (isValid: boolean) => void) => {
          customValidator
            .validate(value)
            .then(validationCallback)
            .catch(_e => validationCallback(false));
        };

        // "as.." is needed because the type definitions is missing the callback signature
        zSchema.registerFormat(customValidator.name, formatValidator as (value: any) => boolean);
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
}

export function buildResponseSchema(payloadSchema: JSONSchema4): JSONSchema4 {
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

export function buildPaginatedResponseSchema(payloadSchema: JSONSchema4, maximumItemsPerPage = 100): JSONSchema4 {
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

export async function getRoutes<Context>(
  baseDirectory: string,
  filePattern = "**/!(*.spec|*.test|*.d).+(js|ts)",
): Promise<RouteSource<Context>[]> {
  const globPattern = path.join(baseDirectory, filePattern);

  return new Promise<RouteSource<Context>[]>((resolve, reject) => {
    glob(globPattern, (error, filenames) => {
      /* istanbul ignore if */
      if (error !== null) {
        reject(error);

        return;
      }

      const routes: RouteSource<Context>[] = filenames.map(filename => ({
        group: getRouteGroup(filename, baseDirectory),
        name: getRouteName(filename),
        filename,
        setup: (): RouteDefinition<Context> => {
          const routeSetupFn: RouteSetupFn<Context> = require(filename).default;

          /* istanbul ignore if */
          // tslint:disable-next-line:strict-type-predicates
          if (typeof routeSetupFn !== "function") {
            throw new Error(
              `Export of route "${getRouteName(
                filename,
              )}" in "${filename}" is expected to be a function but got ${typeof routeSetupFn}`,
            );
          }

          const routeDefinition = routeSetupFn();

          return routeDefinition;
        },
      }));

      resolve(routes);
    });
  });
}

export function sortRoutes(routes: SortableRoute[]) {
  routes
    // sort by number of parameters and path
    .sort((routeA, routeB) => {
      const isSameGroup = routeA.group === routeB.group;

      // sort by group name if they are different
      if (!isSameGroup) {
        return routeA.group.localeCompare(routeB.group);
      }

      // sort by slash count if not the same (routes with more slashes to the front)
      const slashCountA = routeA.path.split("/").length - 1;
      const slashCountB = routeB.path.split("/").length - 1;
      const slashResult = slashCountA > slashCountB ? -1 : slashCountA < slashCountB ? 1 : 0;

      if (slashResult !== 0) {
        return slashResult;
      }

      // sort by parameter count if not the same (routes with more parameters to the end)
      const parameterCountA = routeA.path.split(":").length - 1;
      const parameterCountB = routeB.path.split(":").length - 1;
      const parameterResult = parameterCountA > parameterCountB ? 1 : parameterCountA < parameterCountB ? -1 : 0;

      if (parameterResult !== 0) {
        return parameterResult;
      }

      // don't change the order
      return 0;
    })
    // then sort by group name
    .sort((routeA, routeB) => routeA.group.localeCompare(routeB.group));
}

export function getPaginationPageOptions(query: any, defaultItemsPerPage = 10): PaginationOptions {
  const options = normalizeType<PaginationOptionsPartial>(query);

  return {
    page: options.page !== undefined ? options.page : 1,
    itemsPerPage: options.itemsPerPage !== undefined ? options.itemsPerPage : defaultItemsPerPage,
  };
}

/* istanbul ignore next */
function formatJsonPath(jsonPath: string): string {
  if (jsonPath.substring(0, 2) === "#/") {
    return jsonPath.substring(2);
  }

  return jsonPath;
}

function lowerCaseFirst(message: string): string {
  /* istanbul ignore if */
  if (message.length < 2) {
    return message;
  }

  return `${message.substring(0, 1).toLowerCase()}${message.substring(1)}`;
}

export function combineMessages(messages: string[]): string {
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

function buildErrorMessage(validationErrors: zSchema.SchemaErrorDetail[]) {
  const messages = validationErrors.map(error => {
    const formattedPath = formatJsonPath(error.path);

    return `${formattedPath.length > 0 ? `${formattedPath}: ` : ""}${lowerCaseFirst(error.message)}`;
  });
  const message = combineMessages(messages);

  return `Validation failed: ${message}`;
}

function augmentExpressRequest<Context>(request: Request, context: Context): RouteRequest<Context> {
  // tslint:disable-next-line prefer-object-spread
  return Object.assign(request, context);
}

function augmentExpressResponse(response: Response): RouteResponse {
  const success = async <T>(
    payload: T,
    responseSchema: JSONSchema4,
    customValidators?: CustomValidator[],
    status = HttpStatus.OK,
  ) => {
    const responseData: RouteResponsePayload<T> = {
      payload,
      success: true,
      error: null,
      validationErrors: [],
    };

    const schemaValidationResult = await validateJsonSchema(responseData, responseSchema, customValidators);

    if (!schemaValidationResult.isValid) {
      // throw new InvalidApiResponseError(responseData, responseSchema, schemaValidationResult.errors);

      const error = new InvalidApiResponseError(responseData, responseSchema, schemaValidationResult.errors);
      const errorResponseData: RouteResponsePayload<T> = {
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
  };

  // tslint:disable-next-line prefer-object-spread
  return Object.assign(response, {
    success: async <T>(payload: T, responseSchema: JSONSchema4, customValidators?: CustomValidator[]) =>
      success(payload, responseSchema, customValidators, HttpStatus.OK),

    created: async <T>(payload: T, responseSchema: JSONSchema4, customValidators?: CustomValidator[]) =>
      success(payload, responseSchema, customValidators, HttpStatus.CREATED),

    paginatedSuccess: async <T>(
      items: T[],
      paginationOptions: PaginationOptions,
      itemCount: number,
      responseSchema: JSONSchema4,
      customValidators?: CustomValidator[],
    ) => {
      const payload: PaginatedResponse<T> = {
        items,
        itemCount,
        page: paginationOptions.page,
        pageCount: Math.ceil(itemCount / paginationOptions.itemsPerPage),
        itemsPerPage: paginationOptions.itemsPerPage,
      };

      await success<PaginatedResponse<T>>(payload, responseSchema, customValidators, HttpStatus.OK);
    },

    fail: async (
      validationErrors: zSchema.SchemaErrorDetail[],
      responseSchema: JSONSchema4,
      customValidators?: CustomValidator[],
      customErrorMessage?: string,
    ) => {
      const responseData: RouteResponsePayload<null> = {
        payload: null,
        success: false,
        error: customErrorMessage !== undefined ? customErrorMessage : buildErrorMessage(validationErrors),
        validationErrors,
      };

      const schemaValidationResult = await validateJsonSchema(responseData, responseSchema, customValidators);

      /* istanbul ignore if */
      if (!schemaValidationResult.isValid) {
        const error = new InvalidApiResponseError(responseData, responseSchema, schemaValidationResult.errors);
        const errorResponseData: RouteResponsePayload<null> = {
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
    },
  });
}

function getRouteGroup(filename: string, baseDirectory: string): string {
  const relativePath = path.relative(baseDirectory, filename);
  const basename = path.basename(relativePath);

  return path.basename(relativePath.substring(0, relativePath.length - basename.length - 1));
}

function getRouteName(filename: string): string {
  return path.basename(filename, path.extname(filename));
}

function getRouteWithoutParameters(route: string): string {
  const tokens = route.split(/\//);

  return tokens.filter(token => token.substring(0, 1) !== ":").join("/");
}
