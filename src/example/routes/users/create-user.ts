import { normalizeType } from "normalize-type";
import { buildResponseSchema, CustomValidator, JSONSchema4, RouteDefinition, validateJsonSchema } from "../../../";
import { ServerContext } from "../../app";
import User from "../../models/User";
import userSchema from "../../schemas/user-schema";
import validateUniqueEmail from "../../validators/validateUniqueEmail";

export interface CreateUserRequest {
  name: string;
  email: string;
}

export const requestSchema: JSONSchema4 = {
  title: "Create user",
  description: "Create a new user account",
  type: "object",
  properties: {
    name: {
      type: "string",
      title: "Name",
      description: "User name",
      minLength: 3,
      maxLength: 100,
    },
    email: {
      type: "string",
      title: "Email",
      description: "Email address",
      minLength: 3,
      maxLength: 256,
      allOf: [
        {
          format: "email",
        },
        {
          format: "unique-email",
        },
      ],
    },
  },
  required: ["name", "email"],
};

export const responseSchema: JSONSchema4 = buildResponseSchema(userSchema);

export default (): RouteDefinition<ServerContext> => ({
  path: "",
  method: "post",
  metadata: {
    title: "Register user",
    description: "Register a new user account",
    sinceVersion: "1.0.0",
    isDeprecated: false,
  },
  requestSchema,
  responseSchema,
  handler: async (request, response, _next) => {
    const requestData = normalizeType<CreateUserRequest>(request.body);
    const validators: CustomValidator[] = [validateUniqueEmail(request.db.user)];
    const validationResult = await validateJsonSchema(requestData, requestSchema, validators);

    if (!validationResult.isValid) {
      response.fail(validationResult.errors, responseSchema, validators);

      return;
    }

    const user = await request.db.user.save(requestData);

    response.created<User>(user, responseSchema, validators);
  },
});
