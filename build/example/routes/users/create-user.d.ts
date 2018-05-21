import { JSONSchema4, RouteDefinition } from "../../../";
import { ServerContext } from "../../app";
export interface CreateUserRequest {
    name: string;
    email: string;
}
export declare const requestSchema: JSONSchema4;
export declare const responseSchema: JSONSchema4;
declare const _default: () => RouteDefinition<ServerContext>;
export default _default;
