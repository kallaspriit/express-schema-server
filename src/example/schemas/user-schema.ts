import { JSONSchema4 } from "../../";

const userSchema: JSONSchema4 = {
  title: "User info",
  description: "Registered user info",
  type: "object",
  properties: {
    id: {
      title: "Id",
      description: "User id",
      type: "number",
      minLength: 3,
      maxLength: 100,
    },
    name: {
      title: "Name",
      description: "User name",
      type: "string",
      minLength: 3,
      maxLength: 100,
    },
    email: {
      title: "Email",
      description: "Email address",
      type: "string",
      minLength: 3,
      maxLength: 256,
      format: "email",
    },
  },
  required: ["id", "name", "email"],
};

export default userSchema;
