import * as bodyParser from "body-parser";
import * as express from "express";
import * as path from "path";
import expressSchemaServer, { getRoutes } from "../";
import Database from "./lib/Database";
import User from "./models/User";

// fake database manager of various models
export interface IDatabaseManager {
  user: Database<User>;
}

// context provided to all routes
export interface IServerContext {
  db: IDatabaseManager;
  loggedInUser?: User;
}

// use a async function to be able to use async/await
export default async function setupApp(): Promise<express.Express> {
  // create a new express app
  const app = express();

  // add json and urlencoded body parser middlewares
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );

  // setup server context that gets merged into the express request
  const context: IServerContext = {
    db: {
      user: new Database<User>()
    }
  };

  // find all routes
  const routes = await getRoutes<IServerContext>(path.join(__dirname, "routes"));

  // add the express schema server middleware
  app.use(
    "/",
    expressSchemaServer<IServerContext>({
      routes,
      context,
      metadata: {
        title: "Example API",
        description: "Provides example functionality",
        version: "1.0.0"
      }
    })
  );

  return app;
}
