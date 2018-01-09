"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
// setup and start the app
app_1.default()
    .then(app => {
    app.listen(3000, () => {
        console.log("server started on port 3000");
    });
})
    .catch(e => {
    console.error("starting application failed");
    console.error(e);
});
//# sourceMappingURL=index.js.map