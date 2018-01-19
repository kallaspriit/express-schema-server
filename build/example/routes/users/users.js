"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// schema for IUser used by several routes returning user info
exports.userSchema = {
    title: "User info",
    description: "Registered user info",
    type: "object",
    properties: {
        id: {
            title: "Id",
            description: "User id",
            type: "number",
            minLength: 3,
            maxLength: 100
        },
        name: {
            title: "Name",
            description: "User name",
            type: "string",
            minLength: 3,
            maxLength: 100
        },
        email: {
            title: "Email",
            description: "Email address",
            type: "string",
            minLength: 3,
            maxLength: 256,
            format: "email"
        }
    },
    required: ["id", "name", "email"]
};
// transform the whole user model containing information like password hash to match a public IUser interface
function transformUser(model) {
    return {
        id: model.id !== undefined ? model.id : 0,
        name: model.name,
        email: model.email
    };
}
exports.transformUser = transformUser;
//# sourceMappingURL=users.js.map