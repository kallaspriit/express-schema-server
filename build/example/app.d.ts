/// <reference types="express" />
import * as express from 'express';
import Database from './lib/Database';
import User from './models/User';
export interface IDatabaseManager {
    user: Database<User>;
}
export interface IServerContext {
    db: IDatabaseManager;
    loggedInUser?: User;
}
export default function setupApp(): Promise<express.Express>;
