import { IRouteDefinition } from "../../../";
import { IServerContext } from "../../app";

export default (): IRouteDefinition<IServerContext> => ({
  path: "/custom-error",
  method: "get",
  metadata: {
    title: "Custom error",
    description: "Returns failure with custom error",
    sinceVersion: "1.0.0",
    isDeprecated: false,
  },
  requestSchema: {},
  responseSchema: {},
  handler: async (_request, response, _next) => {
    response.fail([], {}, [], "Custom error message");
  },
});
