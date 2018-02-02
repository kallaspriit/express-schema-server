import * as HttpStatus from "http-status-codes";
import { JSONSchema4 } from "json-schema";
import { buildResponseSchema, IRouteDefinition } from "../../../";
import { IServerContext } from "../../app";
import User from "../../models/User";

export const responseSchema: JSONSchema4 = buildResponseSchema({
  type: "object",
  properties: {
    message: {
      type: "string",
    },
  },
});

export default (): IRouteDefinition<IServerContext> => ({
  path: "/login",
  method: "get",
  metadata: {
    title: "Get user info",
    description: "Returns registered user info by email",
    sinceVersion: "1.0.0",
    isDeprecated: false,
  },
  requestSchema: {},
  responseSchema,
  // handler can be an array of handlers
  handler: [
    // additional middlewares could perform authentication etc
    (request, _response, next) => {
      // use basic auth etc to login the user
      // console.log('authorization', request.headers.authorization);

      request.loggedInUser = new User("Jack Daniels", "jack@daniels.com");

      next();
    },
    async (request, response, _next) => {
      /* istanbul ignore if */
      if (!request.loggedInUser) {
        response.status(HttpStatus.UNAUTHORIZED).send("You need to be logged in to access this resource");

        return;
      }

      response.success(
        {
          message: `Hello ${request.loggedInUser.name}`,
        },
        responseSchema,
      );
    },
  ],
});
