import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

   
function BasePage() {
  const [addingFolder, setAddingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [activeFolder, setActiveFolder] = useState(null);
  const [projects, setProjects] = useState([]);
  const [folders, setFolders] = useState([]);
  const [openFolders, setOpenFolders] = useState({});
  const createProject = async () => {
    try {
      const res = await fetch("http://localhost:5000/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "New Project",
          folder_id: activeFolder,
        }),
      });

      const newProject = await res.json();

      setProjects((prev) => [...prev, newProject]);

      navigate(`/newVisualization/${newProject.id}`);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };
  const getFolders = async () => {
    const res = await fetch("http://localhost:5000/folders");
    const data = await res.json();
    setFolders(data);
  };
const createFolder = async () => {

  if (!folderName.trim()) return;

  await fetch("http://localhost:5000/folders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: folderName,
      parent_id: activeFolder
    })
  });
  await getFolders();
  setFolderName("");
  setAddingFolder(false);
};
  const getProjects = async (folderId) => {
      let url = "http://localhost:5000/projects";
      if (folderId !==null && folderId !== undefined) {
        url += `?folder_id=${folderId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setProjects(data);
  };
  const toggleFolder = (id) => {
    setOpenFolders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  const renderFolders = (parentId = null, level = 0) => {
    return folders
      .filter(folder => folder.parent_id === parentId)
      .map(folder => (
        <div key={folder.id}>

          <div
            onClick={(e) => {
              e.stopPropagation();
              setActiveFolder(folder.id);
              toggleFolder(folder.id);
            }}
            className={`cursor-pointer hover:bg-gray-100 flex items-center gap-2 py-1
              ${activeFolder === folder.id ? "bg-gray-200 font-semibold" : "bg-transparent"}`}
            style={{ marginLeft: level * 12 }}
          >
            <span>
              {openFolders[folder.id] ? "▼" : "▶"}
            </span>

            📁 {folder.name}
          </div>

          {openFolders[folder.id] &&
            renderFolders(folder.id, level + 1)
          }

        </div>
      ));
  };
  const renderFoldersForProjects = (parentId = null) => {
    return folders
      .filter(folder => folder.parent_id === parentId)
  };
  useEffect(() => {
    const init = async () => {
      const res = await fetch("http://localhost:5000/folders");
      const data = await res.json();
      setFolders(data);
      
      const rootFolder = data.find(f => f.parent_id === null);

      if (rootFolder) {
        setActiveFolder(rootFolder.id);
      } else {
        getProjects(null);
      }
    };

    init();
  }, []);
  useEffect(() => {
  getProjects(activeFolder);
}, [activeFolder]);
  const navigate = useNavigate();
  

  return (
    <div className="flex min-h-screen min-w-screen bg-gray-100">

      <div className="w-[240px] bg-white border-r p-5 flex flex-col gap-4">
        <button
          onClick={() => navigate("/NewVisualization")}
          className="bg-blue-500 text-white py-2 rounded"
        >
          + New visualization
        </button>

        <button className="bg-gray-200 py-2 rounded">
          + New story
        </button>

        <div className="mt-6 flex flex-col gap-2 text-gray-600">
            <span className="font-semibold">Projects</span>
            <button
                className="bg-gray-200 text-sm text-left text-gray-700 py-2 rounded">
                My projects
            </button>
            <div className="left-5 relative">
              {renderFolders(null)}
              {addingFolder ? (

                <input
                  autoFocus
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createFolder();
                    if (e.key === "Escape") setAddingFolder(false);
                  }}
                  placeholder="Folder name..."
                  className="bg-transparent focus:outline-none text-sm py-2 px-2 border rounded"
                />

              ) : (

                <button
                  onClick={() => setAddingFolder(true)}
                  className="bg-transparent text-sm text-left text-gray-400 py-2 rounded hover:text-gray-900"
                >
                  + Add new folder
                </button>

              )}
            </div>
        </div>

      </div>


      <div className="flex flex-1 p-8 flex-col">

        <div className="flex justify-between mb-8">

          <input
            type="text"
            placeholder="Search projects..."
            className="w-[350px] p-3 border rounded-lg"
          />



        </div>


        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 ">

          <div
            className="border-dashed border-2 border-gray-300 h-[280px] w-[280px] flex items-center justify-center rounded-lg cursor-pointer hover:bg-gray-50"
            onClick={createProject}
          >
            + Create project
          </div>
          {renderFoldersForProjects(activeFolder).map((folder) => (
            <div
              key={folder.id}
              
              onClick={() => setActiveFolder(folder.id)}
              className="bg-white h-[280px] w-[280px] flex justify-center p-4 rounded-lg border hover:shadow cursor-pointer"
            >
              <div className="text-lg text-gray-500 font-semibold">
                {folder.name}
              </div>
            </div>
          ))}

          {projects.map((project) => (
            <div
              key={project.id}
              onClick={()=>navigate(`/newVisualization/${project.id}`)}
              className="bg-white h-[280px] w-[280px] p-4 rounded-lg border hover:shadow cursor-pointer"
            >
              <div className="text-lg text-gray-500 font-semibold">
                {project.name}
              </div>

              {/* <div className="text-gray-500 text-sm">
                {project.type}
              </div> */}
            </div>
          ))}
          

        </div>

      </div>

    </div>
  );
}

export default BasePage;