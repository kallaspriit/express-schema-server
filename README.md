# Express.js JSON schema server middleware

[![Travis](https://img.shields.io/travis/kallaspriit/express-schema-server.svg)](https://travis-ci.org/kallaspriit/express-schema-server)
[![Coverage](https://img.shields.io/coveralls/kallaspriit/express-schema-server.svg)](https://coveralls.io/github/kallaspriit/express-schema-server)
[![Downloads](https://img.shields.io/npm/dm/express-schema-server.svg)](http://npm-stat.com/charts.html?package=express-schema-server&from=2015-08-01)
[![Version](https://img.shields.io/npm/v/express-schema-server.svg)](http://npm.im/express-schema-server)
[![License](https://img.shields.io/npm/l/express-schema-server.svg)](http://opensource.org/licenses/MIT)

**Middleware for describing and validating your REST API routes using JSON schemas.**

- Automatic validation of both inputs and outputs using [JSON schema](http://json-schema.org/).
- Self-descriptive, includes automatic endpoints for all route descriptors.
- Includes extensive example showing how to organize your code, perform authentication and use databases.
- The route descriptors can be used to generate automatic documentation, testing user interface, TypeScript definitions etc.
- Written in [TypeScript](https://www.typescriptlang.org/).
- Minimum boilerplate.
- Every endpoint handler is in a separate file.
- Easy to test with [supertest](https://github.com/visionmedia/supertest).

## Installation

This package is distributed via npm

```cmd
npm install express-schema-server
```

## Commands

- `npm run build` to build the production version.
- `npm run test` to run tests.
- `npm run lint` to lint the codebase.
- `npm run start` to start the example application.
- `npm run debug` to start the example application in debug mode (`--inspect`).
- `npm run coverage` to gather code coverage.
- `npm run prettier` to run prettier.

## Example

See `src/example` directory for a full working example code and run `npm start` to try it out for yourself.

Following is an example route for [creating a new user](https://github.com/kallaspriit/express-schema-server/blob/master/src/example/routes/users/create-user.ts).

```typescript
import { normalizeType } from "normalize-type";
import { buildResponseSchema, ICustomValidator, IRouteDefinition, JSONSchema4, validateJsonSchema } from "../../../";
import { IServerContext } from "../../app";
import validateUniqueEmail from "../../validators/validateUniqueEmail";
import { IUser, transformUser, userSchema } from "./users";

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

export default (): IRouteDefinition<IServerContext> => ({
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
    const validators: ICustomValidator[] = [validateUniqueEmail(request.db.user)];
    const validationResult = await validateJsonSchema(requestData, requestSchema, validators);

    if (!validationResult.isValid) {
      response.fail(validationResult.errors, responseSchema, validators);

      return;
    }

    const user = await request.db.user.save(requestData);

    response.success<IUser>(transformUser(user), responseSchema, validators);
  },
});
```
