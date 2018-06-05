import * as express from "express";
import Database from "./lib/Database";
import User from "./models/User";
export interface DatabaseManager {
    user: Database<User>;
}
export interface ServerContext {
    db: DatabaseManager;
    loggedInUser?: User;
}
export default function setupApp(): Promise<express.Express>;
