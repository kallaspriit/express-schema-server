import { JSONSchema4 } from '../../../';
import User from '../../models/User';
export interface IUser {
    id: number;
    name: string;
    email: string;
}
export declare const userSchema: JSONSchema4;
export declare function transformUser(model: User): IUser;
