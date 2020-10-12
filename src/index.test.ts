import * as HttpStatus from "http-status-codes";
import * as supertest from "supertest";
import { Logger } from "ts-log";

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
    const getResponse = await app.get("/schema").send();

    expect(getResponse.status).toEqual(HttpStatus.OK);
    expect(getResponse.body).toMatchSnapshot();
  });

  it("provides schema endpoint for specific endpoints", async () => {
    const getResponse = await app.get("/schema/users/post").send();

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
      { group: "invites", path: "/:inviteId" },
      { group: "admins", path: "/" },
      { group: "users", path: "/" },
      { group: "users", path: "/:id" },
      { group: "users", path: "/deleted" },
      { group: "admins", path: "/b" },
      { group: "invites", path: "/" },
      { group: "admins", path: "/:id" },
      { group: "invites", path: "/users" },
      { group: "admins", path: "/a" },
      { group: "invites", path: "/user/disable" },
      { group: "invites", path: "" },
      { group: "invites", path: "/users/2" },
    ];

    // TODO: ideally we'd like to see this
    // const expectedResult = [
    //   { group: "admins", path: "/a" },
    //   { group: "admins", path: "/b" },
    //   { group: "admins", path: "/" },
    //   { group: "admins", path: "/:id" },
    //   { group: "invites", path: "/user/disable" },
    //   { group: "invites", path: "/users/2" },
    //   { group: "invites", path: "/users" },
    //   { group: "invites", path: "/" },
    //   { group: "invites", path: "" },
    //   { group: "invites", path: "/:inviteId" },
    //   { group: "users", path: "/deleted" },
    //   { group: "users", path: "/" },
    //   { group: "users", path: "/:id" },
    // ];

    const expectedResult = [
      { group: "admins", path: "/" },
      { group: "admins", path: "/a" },
      { group: "admins", path: "/b" },
      { group: "admins", path: "/:id" },
      { group: "invites", path: "/user/disable" },
      { group: "invites", path: "/users/2" },
      { group: "invites", path: "" },
      { group: "invites", path: "/" },
      { group: "invites", path: "/users" },
      { group: "invites", path: "/:inviteId" },
      { group: "users", path: "/" },
      { group: "users", path: "/deleted" },
      { group: "users", path: "/:id" },
    ];

    // test provided order
    const sortA = [...routes];
    sortRoutes(sortA);
    // console.log("EXPECTED", JSON.stringify(expectedResult, null, "  "));
    // console.log("RESULT A", JSON.stringify(sortA, null, "  "));
    expect(sortA).toEqual(expectedResult);

    // test with inverted input
    const sortB = [...routes].reverse();
    sortRoutes(sortB);
    expect(sortB).toEqual(expectedResult);
  });
});

// these tests initiate their own app
describe("express-schema-server", () => {
  it("should accept optional logger", async () => {
    const myLogger: Logger = {
      trace: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    app = supertest(
      await setupApp({
        log: myLogger,
      }),
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((myLogger.info as any).mock.calls).toMatchSnapshot();
  });

  it("should accept and apply optional simulated latency", async () => {
    app = supertest(
      await setupApp({
        simulatedLatency: 100,
      }),
    );

    const startTime = Date.now();
    const getResponse = await app.get("/users").send();
    const timeTaken = Date.now() - startTime;

    expect(getResponse.status).toEqual(HttpStatus.OK);
    expect(getResponse.body).toMatchSnapshot();
    expect(timeTaken).toBeGreaterThanOrEqual(100);
  });
});
