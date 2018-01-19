import * as HttpStatus from "http-status-codes";
import * as supertest from "supertest";
import setupApp from "../../app";
import { IUser } from "./users";

let app: supertest.SuperTest<supertest.Test>;
let userCount = 0;

async function createUser(): Promise<IUser> {
  userCount++;

  const response = await app.post("/users").send({
    name: `Jack Daniels #${userCount}`,
    email: `jack@daniels-${userCount}.com`
  });

  return response.body.payload as IUser;
}

async function createUsers(count: number): Promise<IUser[]> {
  const users: IUser[] = [];

  for (let i = 0; i < count; i++) {
    users.push(await createUser());
  }

  return users;
}

describe("get-users-route", () => {
  beforeEach(async () => {
    app = supertest(await setupApp());
  });

  it("should return empty list of users when none exist", async () => {
    const testUserCount = 0;

    await createUsers(testUserCount);

    const response = await app.get("/users").send();

    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.payload).toMatchSnapshot();
  });

  it("should return single created user", async () => {
    const testUserCount = 1;

    await createUsers(testUserCount);

    const response = await app.get("/users").send();

    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.payload).toMatchSnapshot();
  });

  it("should return first page of multiple pages", async () => {
    const testUserCount = 4;

    await createUsers(testUserCount);

    const response = await app.get("/users").send();

    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.payload).toMatchSnapshot();
  });

  it("should return second page of multiple pages", async () => {
    const testUserCount = 4;

    await createUsers(testUserCount);

    const response = await app.get("/users?page=2").send();

    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.payload).toMatchSnapshot();
  });

  it("should allow specifying number of items on a page", async () => {
    const testUserCount = 5;

    await createUsers(testUserCount);

    const response = await app.get("/users?page=2&itemsPerPage=2").send();

    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.payload).toMatchSnapshot();
  });

  it("should return empty set for page too large", async () => {
    const testUserCount = 4;

    await createUsers(testUserCount);

    const response = await app.get("/users?page=3").send();

    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body.success).toBe(true);
    expect(response.body.payload).toMatchSnapshot();
  });

  it("should return validation error for invalid page number", async () => {
    const testUserCount = 4;

    await createUsers(testUserCount);

    const response = await app.get("/users?page=0").send();

    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
    expect(response.body.success).toBe(false);
    expect(response.body.validationErrors).toMatchSnapshot();
  });

  it("should return validation error for invalid page number", async () => {
    const testUserCount = 4;

    await createUsers(testUserCount);

    const response = await app.get("/users?page=-1").send();

    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
    expect(response.body.success).toBe(false);
    expect(response.body.validationErrors).toMatchSnapshot();
  });
});
