import * as HttpStatus from "http-status-codes";
import * as supertest from "supertest";
import setupApp from "./example/app";
import {
  combineMessages,
  CustomValidator,
  DetailedError,
  getPaginationPageOptions,
  JSONSchema4,
  sortRoutes,
  validateJsonSchema,
} from "./index";

let app: supertest.SuperTest<supertest.Test>;

const normalSchema: JSONSchema4 = {
  title: "Test schema",
  description: "Testing JSON schema",
  type: "object",
  properties: {
    name: {
      title: "Name",
      description: "User name",
      type: "string",
      minLength: 3,
    },
  },
  required: ["name"],
};

const errorSchema: JSONSchema4 = {
  title: "Test schema",
  description: "Testing JSON schema",
  type: "object",
  properties: {
    name: {
      title: "Name",
      description: "User name",
      type: "string",
      minLength: 3,
      format: "throws-error",
    },
  },
  required: ["name"],
};

function validateThrowsError(): CustomValidator {
  return {
    name: "throws-error",
    validate: async (_value: string) => {
      throw new Error("Validator error message");
    },
  };
}

describe("express-schema-server", () => {
  beforeEach(async () => {
    app = supertest(await setupApp());
  });

  it("provides schema endpoint for all endpoints", async () => {
    const getResponse = await app.get(`/schema`).send();

    expect(getResponse.status).toEqual(HttpStatus.OK);
    expect(getResponse.body).toMatchSnapshot();
  });

  it("provides schema endpoint for specific endpoints", async () => {
    const getResponse = await app.get(`/schema/users/post`).send();

    expect(getResponse.status).toEqual(HttpStatus.OK);
    expect(getResponse.body).toMatchSnapshot();
  });

  it("performs valid json schema validation", async () => {
    const data = {
      name: "Jack Daniels",
    };

    const validationResult = await validateJsonSchema(data, normalSchema);

    expect(validationResult).toMatchSnapshot();
  });

  it("performs invalid json schema validation", async () => {
    const data = {
      name: "J", // too short
    };

    const validationResult = await validateJsonSchema(data, normalSchema);

    expect(validationResult).toMatchSnapshot();
  });

  it("schema validation fails if missing validator", async () => {
    const data = {
      name: "Jack Daniels",
    };

    const validationResult = await validateJsonSchema(data, errorSchema, [validateThrowsError()]);

    expect(validationResult).toMatchSnapshot();
  });

  it("provides detailed error class", async () => {
    const error = new DetailedError("Message", { foo: "bar" });

    expect(error).toMatchSnapshot();
  });

  it("provides detailed error class, details are optional", async () => {
    const error = new DetailedError("Message");

    expect(error).toMatchSnapshot();
  });

  it("provides helper for pagination page options", async () => {
    const options = getPaginationPageOptions({
      page: "2",
      itemsPerPage: "5",
    });

    expect(options).toMatchSnapshot();
  });

  it("provides helper for pagination page options, one can specify default items per page", async () => {
    const defaultItemsPerPage = 5;
    const options = getPaginationPageOptions(
      {
        page: "2",
        itemsPerPage: "5",
      },
      defaultItemsPerPage,
    );

    expect(options).toMatchSnapshot();
  });

  it("provides helper for combining messages", async () => {
    const message1 = combineMessages([]);
    const message2 = combineMessages(["Test1"]);
    const message3 = combineMessages(["Test1", "Test2"]);
    const message4 = combineMessages(["Test1", "Test2", "Test3"]);

    expect(message1).toMatchSnapshot();
    expect(message2).toMatchSnapshot();
    expect(message3).toMatchSnapshot();
    expect(message4).toMatchSnapshot();
  });

  it("sorts routes correctly", async () => {
    const routes = [
      { group: "users", path: "/" },
      { group: "users", path: "/:id" },
      { group: "users", path: "/deleted" },
      { group: "admins", path: "/" },
      { group: "admins", path: "/:id" },
      { group: "admins", path: "/b" },
      { group: "admins", path: "/a" },
    ];

    sortRoutes(routes);

    expect(routes).toEqual([
      { group: "admins", path: "/:id" },
      { group: "admins", path: "/" },
      { group: "admins", path: "/a" },
      { group: "admins", path: "/b" },
      { group: "users", path: "/:id" },
      { group: "users", path: "/" },
      { group: "users", path: "/deleted" },
    ]);
  });
});
