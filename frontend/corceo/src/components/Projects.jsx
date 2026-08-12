import { useEffect, useState } from "react";
import {
  apiRequest,
} from "../api/client";

function Projects() {

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await apiRequest("/projects");
        setProjects(data);
      } catch (err) {
        console.error("Failed to load projects:", err);
      }
    };

    loadProjects();
  }, []);

  return (
    <div>
      {projects.map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}

export default Projects;