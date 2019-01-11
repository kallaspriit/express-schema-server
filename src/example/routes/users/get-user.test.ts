import * as HttpStatus from "http-status-codes";
import * as supertest from "supertest";

import setupApp from "../../app";

let app: supertest.SuperTest<supertest.Test>;

describe("get-user", () => {
  beforeEach(async () => {
    app = supertest(await setupApp());
  });

  it("should return registered user info", async () => {
    const createResponse = await app.post("/users").send({
      name: "Jack Daniels",
      email: "jack@daniels.com",
    });

    expect(createResponse.status).toEqual(HttpStatus.CREATED);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.payload).toMatchSnapshot();

    const getResponse = await app.get(`/users/${createResponse.body.payload.id}`).send();

    expect(getResponse.status).toEqual(HttpStatus.OK);
    expect(getResponse.body.success).toBe(true);
    expect(getResponse.body.payload).toMatchSnapshot();
  });

  it("should return validation error for invalid user id", async () => {
    const getResponse = await app.get("/users/abc").send();

    expect(getResponse.status).toEqual(HttpStatus.BAD_REQUEST);
    expect(getResponse.body.success).toBe(false);
    expect(getResponse.body.validationErrors).toMatchSnapshot();
  });

  it("should return 404 not found for non-existing user", async () => {
    const getResponse = await app.get("/users/666").send();

    expect(getResponse.status).toEqual(HttpStatus.NOT_FOUND);
    expect(getResponse.text).toMatchSnapshot();
  });
});
