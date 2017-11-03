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
const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const _1 = require("../");
const Database_1 = require("./lib/Database");
// use a async function to be able to use async/await
function setupApp() {
    return __awaiter(this, void 0, void 0, function* () {
        // create a new express app
        const app = express();
        // add json and urlencoded body parser middlewares
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended: true,
        }));
        // setup server context that gets merged into the express request
        const context = {
            db: {
                user: new Database_1.default(),
            },
        };
        // find all routes
        const routes = yield _1.getRoutes(path.join(__dirname, 'routes'));
        // add the express schema server middleware
        app.use('/', _1.default({
            routes,
            context,
            metadata: {
                title: 'Example API',
                description: 'Provides example functionality',
                version: '1.0.0',
            },
        }));
        return app;
    });
}
exports.default = setupApp;
//# sourceMappingURL=app.js.map