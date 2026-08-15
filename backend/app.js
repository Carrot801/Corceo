// backend/app.js

const express = require("express");
const cors = require("cors");

const projectsRoutes =
  require("./routes/projects");

const foldersRoutes =
  require("./routes/folders");

const uploadRoutes =
  require("./routes/upload");

const dataRoutes =
  require("./routes/data");

const chartsRoutes =
  require("./routes/charts");

const searchRoutes =
  require("./routes/search");

const storiesRoutes =
  require("./routes/stories");

const authRoutes =
  require("./routes/auth");

const userRoutes =
  require("./routes/user");

const errorHandler =
  require("./middleware/errorHandler");

const app = express();


// =========================
// GLOBAL MIDDLEWARE
// =========================

app.use(cors());

app.use(
  express.json({
    limit: "10mb",
  }),
);

app.use(
  express.urlencoded({
    limit: "10mb",
    extended: true,
  }),
);


// =========================
// ROUTES
// =========================

app.use(
  "/search",
  searchRoutes,
);

app.use(
  "/projects",
  projectsRoutes,
);

app.use(
  "/folders",
  foldersRoutes,
);

app.use(
  "/upload-data",
  uploadRoutes,
);

app.use(
  "/auth",
  authRoutes,
);

app.use(
  "/data",
  dataRoutes,
);

app.use(
  "/charts",
  chartsRoutes,
);

app.use(
  "/stories",
  storiesRoutes,
);

app.use(
  "/users",
  userRoutes,
);


// =========================
// 404
// =========================

app.use((req, res) => {
  res
    .status(404)
    .json({
      error: "Route not found",
    });
});


// =========================
// GLOBAL ERROR HANDLER
// =========================

app.use(errorHandler);


module.exports = app;