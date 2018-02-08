import * as HttpStatus from "http-status-codes";
import * as supertest from "supertest";
import setupApp from "../../app";

let app: supertest.SuperTest<supertest.Test>;

describe("get-user", () => {
  beforeEach(async () => {
    app = supertest(await setupApp());
  });

  it("should return custom error", async () => {
    const response = await app.get("/test/custom-error").send();

    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBe(null);
    expect(response.body.error).toMatchSnapshot();
  });
});
