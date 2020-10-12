import setupApp from "./app";

// setup and start the app
setupApp()
  .then((app) => {
    const port = 3000;

    app.listen(port, () => {
      console.log("server started on port 3000");
    });

    return app;
  })
  .catch((e) => {
    console.error("starting application failed");
    console.error(e);
  });
