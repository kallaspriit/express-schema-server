import { ICustomValidator, JSONSchema4, validateJsonSchema } from "./index";

// returns valid password for foobar, false otherwise
const validPassword = "foobar";
const validEmail = "foo@bar.com";
const validatePassword: ICustomValidator = {
  name: "valid-password",
  validate: async (password: string) => password === validPassword,
};
const schema: JSONSchema4 = {
  title: "Login",
  description: "Authenticate with username and password",
  type: "object",
  properties: {
    email: {
      type: "string",
      title: "Email",
      description: "Email address",
      minLength: 3,
      maxLength: 256,
      format: "email",
    },
    password: {
      type: "string",
      title: "Password",
      description: "Account password",
      minLength: 6,
      maxLength: 256,
      format: "valid-password",
    },
  },
  required: ["email", "password"],
};
const validators = [validatePassword];

// tslint:disable:no-magic-numbers
describe("express-schema-server", () => {
  it("validates json schema using both built-in and custom validators", async () => {
    const data = {
      email: validEmail,
      password: validPassword,
    };
    const result = await validateJsonSchema(data, schema, validators);

    expect(result.isValid).toEqual(true);
  });

  it("reports missing fields", async () => {
    const data = {
      email: validEmail,
    };
    const result = await validateJsonSchema(data, schema, validators);

    expect(result.isValid).toEqual(false);
    expect(result.errors.length).toEqual(1);
    expect(result.errors).toMatchSnapshot();
  });

  it("reports all issues", async () => {
    const data = {
      email: "",
      password: "",
    };
    const result = await validateJsonSchema(data, schema, validators);

    expect(result.isValid).toEqual(false);
    expect(result.errors.length).toEqual(3);
    expect(result.errors).toMatchSnapshot();
  });

  it("reports invalid custom validator", async () => {
    const data = {
      email: validEmail,
      password: "xxxxxx",
    };
    const result = await validateJsonSchema(data, schema, validators);

    expect(result.isValid).toEqual(false);
    expect(result.errors.length).toEqual(1);
    expect(result.errors).toMatchSnapshot();
  });

  it("reports built in validator along with custom custom validator", async () => {
    const data = {
      email: "yyy",
      password: "xxx",
    };
    const result = await validateJsonSchema(data, schema, validators);

    expect(result.isValid).toEqual(false);
    expect(result.errors.length).toEqual(2);
    expect(result.errors).toMatchSnapshot();
  });
});
