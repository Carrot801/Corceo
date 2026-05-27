const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const projectsRoutes = require("./routes/projects");
const foldersRoutes = require("./routes/folders");
const uploadRoutes = require("./routes/upload");
const dataRoutes = require("./routes/data");
const chartsRoutes = require("./routes/charts");
app.use("/projects", projectsRoutes);
app.use("/folders", foldersRoutes);
app.use("/upload-csv", uploadRoutes);
app.use("/data", dataRoutes);
app.use("/charts", chartsRoutes);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
 