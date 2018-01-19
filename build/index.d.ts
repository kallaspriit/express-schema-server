/// <reference types="z-schema" />
/// <reference types="express" />
import { NextFunction, Request, RequestHandler, Response, Router } from "express";
import { JSONSchema4 } from "json-schema";
import * as zSchema from "z-schema";
export { JSONSchema4 } from "json-schema";
export declare type RouteMethodVerb = "get" | "post" | "delete" | "put";
export interface IRouteMetadata {
    title: string;
    description: string;
    sinceVersion: string;
    isDeprecated: boolean;
}
export interface IRouteDefinition<Context> {
    path: string;
    method: RouteMethodVerb;
    metadata: IRouteMetadata;
    requestSchema: JSONSchema4;
    responseSchema: JSONSchema4;
    handler: RouteRequestHandler<Context> | Array<RouteRequestHandler<Context>>;
}
export interface IRouteSource<Context> {
    group: string;
    name: string;
    filename: string;
    setup: RouteSetupFn<Context>;
}
export declare type IRouteDescriptor<Context> = IRouteSource<Context> & IRouteDefinition<Context>;
export interface IRouteSchema {
    method: RouteMethodVerb;
    group: string;
    name: string;
    path: string;
    endpointUrl: string;
    schemaUrl: string;
    metadata: IRouteMetadata;
    requestSchema: JSONSchema4;
    responseSchema: JSONSchema4;
}
export interface ISchemaMetadata {
    title: string;
    description: string;
    version: string;
}
export interface ISchema {
    metadata: ISchemaMetadata;
    routes: IRouteSchema[];
}
export interface IRouteResponsePayload<T> {
    payload: T | null;
    success: boolean;
    error: string | null;
    validationErrors: zSchema.SchemaErrorDetail[];
    [x: string]: any;
}
export declare type IRouteRequest<Context> = Request & Context;
export interface IRouteResponse extends Response {
    success<T>(payload: T, responseSchema: JSONSchema4, customValidators?: ICustomValidator[]): void;
    paginatedSuccess<T>(items: T[], paginationOptions: IPaginationOptions, itemCount: number, responseSchema: JSONSchema4, customValidators?: ICustomValidator[]): void;
    fail(validationErrors: zSchema.SchemaErrorDetail[], responseSchema: JSONSchema4, customValidators?: ICustomValidator[], customErrorMessage?: string): void;
}
export declare type RouteSetupFn<Context> = () => IRouteDefinition<Context>;
export declare type RouteRequestHandler<Context> = (request: IRouteRequest<Context>, response: IRouteResponse, next: NextFunction) => void;
export interface IJsonSchemaValidationResult {
    isValid: boolean;
    errors: zSchema.SchemaErrorDetail[];
}
export interface IJsonSchemaServerOptions<Context> {
    routes: Array<IRouteSource<Context>>;
    context: Context;
    metadata: ISchemaMetadata;
}
export interface IErrorDetails {
    [x: string]: any;
}
export declare type CustomValidatorFn = (value: any) => Promise<boolean>;
export interface ICustomValidator {
    name: string;
    validate: CustomValidatorFn;
}
export interface IPaginatedResponse<Payload> {
    items: Payload[];
    itemCount: number;
    page: number;
    pageCount: number;
    itemsPerPage: number;
}
export interface IPaginationOptionsPartial {
    page?: number;
    itemsPerPage?: number;
}
export interface IPaginationOptions {
    page: number;
    itemsPerPage: number;
}
export interface IObjectLiteral {
    [key: string]: any;
}
export declare class DetailedError extends Error {
    details: IErrorDetails | null;
    constructor(message: string, details?: IErrorDetails | null);
}
export declare class InvalidApiResponseError extends DetailedError {
    constructor(responseData: IRouteResponsePayload<any>, responseSchema: JSONSchema4, validationErrors: zSchema.SchemaErrorDetail[]);
}
export declare const paginationOptionsSchema: JSONSchema4;
export default function expressSchemaServer<TContext>(options: IJsonSchemaServerOptions<TContext>): Router;
export declare function schemaMiddleware<Context>(metadata: ISchemaMetadata, routes: Array<IRouteDescriptor<Context>>): RequestHandler;
export declare function getRouteSchema<Context>(route: IRouteDescriptor<Context>, baseUrl: string): IRouteSchema;
export declare function buildRoutePath(components: string[]): string;
export declare function validateJsonSchema(data: any, schema: JSONSchema4, customValidators?: ICustomValidator[]): Promise<IJsonSchemaValidationResult>;
export declare function buildResponseSchema(payloadSchema: JSONSchema4): JSONSchema4;
export declare function buildPaginatedResponseSchema(payloadSchema: JSONSchema4, maximumItemsPerPage?: number): JSONSchema4;
export declare function getRoutes<Context>(baseDirectory: string, filePattern?: string): Promise<Array<IRouteSource<Context>>>;
export declare function getPaginationPageOptions(query: any, defaultItemsPerPage?: number): IPaginationOptions;
export declare function combineMessages(messages: string[]): string;
