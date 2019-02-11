import * as express from "express";
import { JsonSchemaServerOptions } from "../";
import Database from "./lib/Database";
import User from "./models/User";
export interface DatabaseManager {
    user: Database<User>;
}
export interface ServerContext {
    db: DatabaseManager;
    loggedInUser?: User;
}
export default function setupApp(overrideOptions?: Partial<JsonSchemaServerOptions<ServerContext>>): Promise<express.Express>;
