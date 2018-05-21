import { CustomValidator } from "../../";
import Database from "../lib/Database";
import User from "../models/User";

// example of a custom validator, returns true if a user with given email does not already exist
export default (db: Database<User>): CustomValidator => ({
  name: "unique-email",
  validate: async (email: string) => {
    const user = await db.getWhere("email", email);

    return user === undefined;
  },
});
