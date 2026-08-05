const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const projectsRoutes = require("./routes/projects");
const foldersRoutes = require("./routes/folders");
const uploadRoutes = require("./routes/upload");
const dataRoutes = require("./routes/data");
const chartsRoutes = require("./routes/charts");
const searchRoutes = require("./routes/search");
const storiesRoutes = require("./routes/stories");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user")


app.use("/search", searchRoutes);
app.use("/projects", projectsRoutes);
app.use("/folders", foldersRoutes);
app.use("/upload-data", uploadRoutes);
app.use("/auth", authRoutes);
app.use("/data", dataRoutes);
app.use("/charts", chartsRoutes);
app.use("/stories", storiesRoutes);
app.use("/users",userRoutes);
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
 