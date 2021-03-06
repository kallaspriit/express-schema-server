import * as HttpStatus from "http-status-codes";
import * as supertest from "supertest";

import setupApp from "../../app";

let app: supertest.SuperTest<supertest.Test>;

describe("create-user", () => {
  beforeEach(async () => {
    app = supertest(await setupApp());
  });

  it("should register valid user", async () => {
    const response = await app.post("/users").send({
      name: "Jack Daniels",
      email: "jack@daniels.com",
    });

    expect(response.status).toEqual(HttpStatus.CREATED);
    expect(response.body.success).toBe(true);
    expect(response.body.payload).toMatchSnapshot();
  });

  it("should return validation error for invalid email", async () => {
    const response = await app.post("/users").send({
      name: "Jack Daniels",
      email: "jack@daniels",
    });

    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toMatchSnapshot();
  });

  it("should return validation error for duplicate email", async () => {
    const response1 = await app.post("/users").send({
      name: "Jack Daniels",
      email: "jack@daniels.com",
    });

    expect(response1.status).toEqual(HttpStatus.CREATED);
    expect(response1.body.success).toBe(true);
    expect(response1.body.payload).toMatchSnapshot();

    const response2 = await app.post("/users").send({
      name: "Jack Daniels",
      email: "jack@daniels.com",
    });

    expect(response2.status).toEqual(HttpStatus.BAD_REQUEST);
    expect(response2.body.success).toBe(false);
    expect(response2.body.payload).toMatchSnapshot();
  });
});
