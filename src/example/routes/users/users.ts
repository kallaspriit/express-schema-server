import { JSONSchema4 } from "../../../";
import User from "../../models/User";

// public user representation, doesn't usually include info like password hash etc
export interface IUser {
  id: number;
  name: string;
  email: string;
}

// schema for IUser used by several routes returning user info
export const userSchema: JSONSchema4 = {
  title: "User info",
  description: "Registered user info",
  type: "object",
  properties: {
    id: {
      title: "Id",
      description: "User id",
      type: "number",
      minLength: 3,
      maxLength: 100
    },
    name: {
      title: "Name",
      description: "User name",
      type: "string",
      minLength: 3,
      maxLength: 100
    },
    email: {
      title: "Email",
      description: "Email address",
      type: "string",
      minLength: 3,
      maxLength: 256,
      format: "email"
    }
  },
  required: ["id", "name", "email"]
};

// transform the whole user model containing information like password hash to match a public IUser interface
export function transformUser(model: User): IUser {
  return {
    id: model.id !== undefined ? model.id : 0,
    name: model.name,
    email: model.email
  };
}
