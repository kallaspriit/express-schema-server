import { NextFunction, Request, RequestHandler, Response, Router } from "express";
import { JSONSchema4 } from "json-schema";
import * as zSchema from "z-schema";
export { JSONSchema4 } from "json-schema";
export declare type RouteMethodVerb = "get" | "post" | "delete" | "put";
export interface RouteMetadata {
    title: string;
    description: string;
    sinceVersion: string;
    isDeprecated: boolean;
}
export interface RouteDefinition<Context> {
    path: string;
    handler: RouteRequestHandler<Context> | Array<RouteRequestHandler<Context>>;
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
export declare type IRouteDescriptor<Context> = RouteSource<Context> & RouteDefinition<Context>;
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
    [x: string]: any;
}
export declare type IRouteRequest<Context> = Request & Context;
export interface RouteResponse extends Response {
    success<T>(payload: T, responseSchema: JSONSchema4, customValidators?: CustomValidator[]): void;
    created<T>(payload: T, responseSchema: JSONSchema4, customValidators?: CustomValidator[]): void;
    paginatedSuccess<T>(items: T[], paginationOptions: PaginationOptions, itemCount: number, responseSchema: JSONSchema4, customValidators?: CustomValidator[]): void;
    fail(validationErrors: zSchema.SchemaErrorDetail[], responseSchema: JSONSchema4, customValidators?: CustomValidator[], customErrorMessage?: string): void;
}
export declare type RouteSetupFn<Context> = () => RouteDefinition<Context>;
export declare type RouteRequestHandler<Context> = (request: IRouteRequest<Context>, response: RouteResponse, next: NextFunction) => void;
export interface JsonSchemaValidationResult {
    isValid: boolean;
    errors: zSchema.SchemaErrorDetail[];
}
export interface JsonSchemaServerOptions<Context> {
    routes: Array<RouteSource<Context>>;
    context: Context;
    metadata: SchemaMetadata;
}
export interface ErrorDetails {
    [x: string]: any;
}
export declare type CustomValidatorFn = (value: any) => Promise<boolean>;
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
export declare class DetailedError extends Error {
    details: ErrorDetails | null;
    constructor(message: string, details?: ErrorDetails | null);
}
export declare class InvalidApiResponseError extends DetailedError {
    constructor(responseData: RouteResponsePayload<any>, responseSchema: JSONSchema4, validationErrors: zSchema.SchemaErrorDetail[]);
}
export declare const paginationOptionsSchema: JSONSchema4;
export default function expressSchemaServer<TContext>(options: JsonSchemaServerOptions<TContext>): Router;
export declare function schemaMiddleware<Context>(metadata: SchemaMetadata, routes: Array<IRouteDescriptor<Context>>): RequestHandler;
export declare function getRouteSchema<Context>(route: IRouteDescriptor<Context>, baseUrl: string): RouteSchema;
export declare function buildRoutePath(components: string[]): string;
export declare function validateJsonSchema(data: any, schema: JSONSchema4, customValidators?: CustomValidator[]): Promise<JsonSchemaValidationResult>;
export declare function buildResponseSchema(payloadSchema: JSONSchema4): JSONSchema4;
export declare function buildPaginatedResponseSchema(payloadSchema: JSONSchema4, maximumItemsPerPage?: number): JSONSchema4;
export declare function getRoutes<Context>(baseDirectory: string, filePattern?: string): Promise<Array<RouteSource<Context>>>;
export declare function getPaginationPageOptions(query: any, defaultItemsPerPage?: number): PaginationOptions;
export declare function combineMessages(messages: string[]): string;
