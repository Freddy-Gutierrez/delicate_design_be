const helmet = require("helmet");
const compression = require("compression");
// remove cors after done with fe
const cors = require("cors");

module.exports = function (app) {
  app.use(helmet());
  app.use(compression());
  app.use(cors({ exposedHeaders: "x-auth-token" }));
};
