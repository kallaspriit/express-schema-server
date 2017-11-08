import { IRouteDefinition, JSONSchema4 } from '../../../';
import { IServerContext } from '../../app';
export interface ICreateUserRequest {
    name: string;
    email: string;
}
export declare const requestSchema: JSONSchema4;
export declare const responseSchema: JSONSchema4;
declare const _default: () => IRouteDefinition<IServerContext>;
export default _default;
