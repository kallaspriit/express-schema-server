import * as HttpStatus from "http-status-codes";
import { JSONSchema4 } from "json-schema";
import { normalizeType } from "normalize-type";
import { buildResponseSchema, RouteDefinition, validateJsonSchema } from "../../../";
import { ServerContext } from "../../app";
import User from "../../models/User";
import userSchema from "../../schemas/user-schema";

export interface GetUserParameters {
  id: number;
}

export const requestSchema: JSONSchema4 = {
  title: "Get user parameters",
  description: "Parameters for getting user info",
  type: "object",
  properties: {
    id: {
      title: "Id",
      description: "User id",
      type: "number",
      minimum: 1,
    },
  },
  required: ["id"],
};

export const responseSchema: JSONSchema4 = buildResponseSchema(userSchema);

export default (): RouteDefinition<ServerContext> => ({
  path: "/:id",
  method: "get",
  metadata: {
    title: "Get user info",
    description: "Returns registered user info by email",
    sinceVersion: "1.0.0",
    isDeprecated: false,
  },
  requestSchema,
  responseSchema,
  handler: async (request, response, _next) => {
    const requestData = normalizeType<GetUserParameters>(request.params);
    const validationResult = await validateJsonSchema(requestData, requestSchema);

    if (!validationResult.isValid) {
      response.fail(validationResult.errors, responseSchema);

      return;
    }

    const user = await request.db.user.getById(requestData.id);

    if (!user) {
      response.status(HttpStatus.NOT_FOUND).send(`User with id "${requestData.id}" could not be found`);

      return;
    }

    response.success<User>(user, responseSchema);
  },
});
