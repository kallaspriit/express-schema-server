"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// example of a custom validator, returns true if a user with given email does not already exist
exports.default = (db) => ({
    name: "unique-email",
    validate: (email) => __awaiter(this, void 0, void 0, function* () {
        const user = yield db.getWhere("email", email);
        return user === undefined;
    })
});
//# sourceMappingURL=validateUniqueEmail.js.map