import { useEffect, useState } from "react";

function Projects() {

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/projects")
      .then(res => res.json())
      .then(data => setProjects(data));
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