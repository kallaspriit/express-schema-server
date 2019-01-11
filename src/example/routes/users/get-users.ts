import { JSONSchema4 } from "json-schema";

import {
  buildPaginatedResponseSchema,
  getPaginationPageOptions,
  paginationOptionsSchema,
  RouteDefinition,
  validateJsonSchema,
} from "../../../";
import { ServerContext } from "../../app";
import User from "../../models/User";
import userSchema from "../../schemas/user-schema";

export const responseSchema: JSONSchema4 = buildPaginatedResponseSchema({
  title: "Users",
  description: "List of paginated users",
  type: "array",
  items: userSchema,
});

export default (): RouteDefinition<ServerContext> => ({
  path: "",
  method: "get",
  metadata: {
    title: "Get users",
    description: "Returns list of paginated users",
    sinceVersion: "1.0.0",
    isDeprecated: false,
  },
  requestSchema: paginationOptionsSchema,
  responseSchema,
  handler: async (request, response, _next) => {
    const defaultItemsPerPage = 3;
    const paginationOptions = getPaginationPageOptions(request.query, defaultItemsPerPage);
    const validationResult = await validateJsonSchema(paginationOptions, paginationOptionsSchema);

    if (!validationResult.isValid) {
      response.fail(validationResult.errors, responseSchema);

      return;
    }

    const result = await request.db.user.getPaginated(paginationOptions);

    response.paginatedSuccess<User>(result.items, paginationOptions, result.count, responseSchema);
  },
});
