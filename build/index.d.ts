/// <reference types="z-schema" />
/// <reference types="express" />
import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { JSONSchema4 } from 'json-schema';
import * as zSchema from 'z-schema';
export interface IRouteResponsePayload<T> {
    payload: T | null;
    success: boolean;
    error: string | null;
    validationErrors: zSchema.SchemaErrorDetail[];
    [x: string]: any;
}
export declare type IRouteRequest<Context> = Request & Context;
export interface IRouteResponse extends Response {
    success<T>(payload: T, responseSchema: JSONSchema4, customValidators?: ICustomValidator[]): Promise<IRouteResponsePayload<T>>;
    paginatedSuccess<T>(items: T[], paginationOptions: IPaginationOptions, itemCount: number, responseSchema: JSONSchema4, customValidators?: ICustomValidator[]): Promise<IRouteResponsePayload<IPaginatedResponse<T>>>;
    fail(validationErrors: zSchema.SchemaErrorDetail[], responseSchema: JSONSchema4, customValidators?: ICustomValidator[], customErrorMessage?: string): Promise<IRouteResponsePayload<null>>;
}
export declare type RouteSetupFn<Context> = () => IRouteDefinition<Context>;
export declare type RouteRequestHandler<Context> = (request: IRouteRequest<Context>, response: IRouteResponse, next: NextFunction) => void;
export declare type RouteMethodVerb = 'get' | 'post' | 'delete';
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
export interface IRoute<Context> extends IRouteSource<Context>, IRouteDefinition<Context> {
    endpoint: string;
}
export interface IRouteSchema {
    group: string;
    path: string;
    method: RouteMethodVerb;
    endpointUrl: string;
    schemaUrl: string;
    metadata: IRouteMetadata;
    requestSchema: JSONSchema4;
    responseSchema: JSONSchema4;
}
export interface IRouteBaseContext<Context> {
    routes?: Array<IRoute<Context>>;
}
export interface IJsonSchemaValidationResult {
    isValid: boolean;
    errors: zSchema.SchemaErrorDetail[];
}
export interface IServerMetadata {
    title: string;
    description: string;
    version: string;
}
export interface IJsonSchemaServerOptions<Context> {
    routes: Array<IRouteSource<Context>>;
    context: Context;
    metadata: IServerMetadata;
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
export interface IPaginationFindOptions<Entity> {
    skip?: number;
    take?: number;
    where?: Partial<Entity> | IObjectLiteral;
}
export declare class DetailedError extends Error {
    details: IErrorDetails | null;
    constructor(message: string, details?: IErrorDetails | null);
}
export declare const paginationOptionsSchema: JSONSchema4;
export default function jsonSchemaServerMiddleware<Context extends IRouteBaseContext<Context>>(options: IJsonSchemaServerOptions<Context>): Router;
export declare function schemaMiddleware<Context>(metadata: IServerMetadata, routes: Array<IRoute<Context>>): RequestHandler;
export declare function getRouteSchema<Context>(route: IRoute<Context>, baseUrl: string): IRouteSchema;
export declare function buildRoutePath(components: string[]): string;
export declare function validateJsonSchema(data: any, schema: JSONSchema4, customValidators?: ICustomValidator[]): Promise<IJsonSchemaValidationResult>;
export declare function buildResponseSchema(payloadSchema: JSONSchema4): JSONSchema4;
export declare function buildPaginatedResponseSchema(payloadSchema: JSONSchema4, maximumItemsPerPage?: number): JSONSchema4;
export declare function getRoutes<Context>(baseDirectory: string): Promise<Array<IRouteSource<Context>>>;
export declare function getPaginationPageOptions(query: any): IPaginationOptions;
export declare function getPaginationFindOptions<Entity>(paginationOptions: IPaginationOptions, where: Partial<Entity>): IPaginationFindOptions<Entity>;
