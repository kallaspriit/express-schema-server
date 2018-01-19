import * as HttpStatus from "http-status-codes";
import * as supertest from "supertest";
import setupApp from "../../app";

let app: supertest.SuperTest<supertest.Test>;

describe("get-user-route", () => {
  beforeEach(async () => {
    app = supertest(await setupApp());
  });

  it("should return validation error for return value not matching response schema", async () => {
    const response = await app.get("/test/invalid-success").send();

    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBe(null);
    expect(response.body.validationErrors).toMatchSnapshot();
  });
});
