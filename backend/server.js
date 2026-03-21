const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const projectsRoutes = require("./routes/projects");
const foldersRoutes = require("./routes/folders");

app.use("/projects", projectsRoutes);
app.use("/folders", foldersRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});