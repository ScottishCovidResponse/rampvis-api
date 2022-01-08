import bodyParser from "body-parser";
import * as swagger from "swagger-express-ts";
import * as express from "express";

function InitSwaggerDoc(app: express.Application) {
  app.use("/api-docs/swagger", express.static("swagger"));
  app.use("/api-docs/swagger/assets", express.static("node_modules/swagger-ui-dist"));
  app.use(bodyParser.json());
  app.use(
    swagger.express({
      definition: {
        info: {
          title: "rampvis:infrastructure-api",
          version: "1.0",
        },
        // externalDocs: {
        //   url: "",
        // },
        // Models can be defined here
      },
    })
  );
}

export { InitSwaggerDoc as InitSwagger };
