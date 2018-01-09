import { JSONSchema4 } from "json-schema";
import { IRouteDefinition } from "../../../";
import { IServerContext } from "../../app";
export interface IGetUserParameters {
    id: number;
}
export declare const requestSchema: JSONSchema4;
export declare const responseSchema: JSONSchema4;
declare const _default: () => IRouteDefinition<IServerContext>;
export default _default;
