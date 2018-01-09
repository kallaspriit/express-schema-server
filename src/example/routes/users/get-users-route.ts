import { JSONSchema4 } from "json-schema";
import {
  buildPaginatedResponseSchema,
  getPaginationPageOptions,
  IRouteDefinition,
  paginationOptionsSchema,
  validateJsonSchema
} from "../../../";
import { IServerContext } from "../../app";
import User from "../../models/User";
import { userSchema } from "./users";

export const responseSchema: JSONSchema4 = buildPaginatedResponseSchema({
  title: "Users",
  description: "List of paginated users",
  type: "array",
  items: userSchema
});

export default (): IRouteDefinition<IServerContext> => ({
  path: "",
  method: "get",
  metadata: {
    title: "Get users",
    description: "Returns list of paginated users",
    sinceVersion: "1.0.0",
    isDeprecated: false
  },
  requestSchema: paginationOptionsSchema,
  responseSchema,
  handler: async (request, response, _next) => {
    const paginationOptions = getPaginationPageOptions(request.query, 3);
    const validationResult = await validateJsonSchema(paginationOptions, paginationOptionsSchema);

    if (!validationResult.isValid) {
      response.fail(validationResult.errors, responseSchema);

      return;
    }

    const result = await request.db.user.getPaginated(paginationOptions);

    response.paginatedSuccess<User>(result.items, paginationOptions, result.count, responseSchema);
  }
});
