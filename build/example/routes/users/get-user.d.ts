import { JSONSchema4 } from "json-schema";
import { RouteDefinition } from "../../../";
import { ServerContext } from "../../app";
export interface GetUserParameters {
    id: number;
}
export declare const requestSchema: JSONSchema4;
export declare const responseSchema: JSONSchema4;
declare const _default: () => RouteDefinition<ServerContext>;
export default _default;
