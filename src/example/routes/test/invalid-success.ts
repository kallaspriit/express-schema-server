import { JSONSchema4 } from "json-schema";
import { buildResponseSchema, IRouteDefinition } from "../../../";
import { IServerContext } from "../../app";

export const responseSchema: JSONSchema4 = buildResponseSchema({
  type: "object",
  properties: {
    id: {
      type: "number",
    },
  },
});

export default (): IRouteDefinition<IServerContext> => ({
  path: "/invalid-success",
  method: "get",
  metadata: {
    title: "Get user info",
    description: "Returns registered user info by email",
    sinceVersion: "1.0.0",
    isDeprecated: false,
  },
  requestSchema: {},
  responseSchema,
  handler: async (_request, response, _next) => {
    response.success(
      {
        id: "not a number",
      },
      responseSchema,
    );
  },
});
