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
  const [openMenu, setOpenMenu] = useState(null);
  const [renamingProject, setRenamingProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [search, setSearch] = useState("");

  const [searchResults, setSearchResults] = useState({
  folders: [],
  projects: [],
});
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
    try {
      let url = "http://localhost:5000/projects";

      if (folderId !== null && folderId !== undefined) {
        url += `?folder_id=${folderId}`;
      }

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      setProjects(data);
    } catch (err) {
      console.error("getProjects failed:", err);
    }
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
  try {
    const res = await fetch(
      "http://localhost:5000/folders"
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    setFolders(data);

  } catch (err) {
    console.error("Folders fetch failed:", err);
  }
};

    init();
  }, []);
  useEffect(() => {
  getProjects(activeFolder);
}, [activeFolder]);

const searchItems = async (value) => {
  const res = await fetch(
    `http://localhost:5000/search?q=${encodeURIComponent(value)}`
  );

  const data = await res.json();

  setSearchResults(data);
};
useEffect(() => {
  const timeout = setTimeout(() => {
    if (search.trim()) {
      searchItems(search);
    }
  }, 300);

  return () => clearTimeout(timeout);
}, [search]);
const navigate = useNavigate();
  

  const renameProject = async (projectId) => {
    if (!newProjectName.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:5000/projects/${projectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newProjectName,
          }),
        }
      );

      const text = await res.text();
      console.log("Server response:", text);
      let data;
      try{
        data = JSON.parse(text);
      } catch (err) {
        console.error("Failed to parse JSON:", err);
        return;
      }

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? data : p
        )
      );

      setRenamingProject(null);
      setNewProjectName("");
    } catch (err) {
      console.error(err);
    }
  };
  const duplicateProject = async (projectId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/projects/duplicate/${projectId}`,
        {
          method: "POST",
        }
      );

      const duplicated = await res.json();

      setProjects((prev) => [...prev, duplicated]);
    } catch (err) {
      console.error(err);
    }
  };
  const deleteProject = async (projectId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/projects/${projectId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Delete failed:", data);
        return;
      }

      setProjects((prev) =>
        prev.filter((p) => p.id !== projectId)
      );

    } catch (err) {
      console.error("Network error:", err);
    }
  };
    // Determine what to display
    const isSearching = search.trim().length > 0;
    const displayedProjects = isSearching ? searchResults.projects : projects;
    const displayedFolders = isSearching ? searchResults.folders : renderFoldersForProjects(activeFolder);
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[350px] p-3 border rounded-lg"
          />



        </div>


        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 ">

          {!isSearching && (
            <div
              className="border-dashed border-2 border-gray-300 h-[280px] w-[280px] flex items-center justify-center rounded-lg cursor-pointer hover:bg-gray-50"
              onClick={createProject}
            >
              + Create project
            </div>
          )}

          {/* 2. Map through displayedFolders (either current folder or search results) */}
          {displayedFolders.map((folder) => (
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

          {/* 3. Map through displayedProjects (either current folder or search results) */}
          {displayedProjects.map((project) => (
            <div
              key={project.id}
              className="relative bg-white h-[280px] w-[280px] rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* MENU */}
              <div className="absolute top-2 right-2 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenu(
                      openMenu === project.id
                        ? null
                        : project.id
                    );
                  }}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  ⋮
                </button>

                {openMenu === project.id && (
                  <div
                    className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg w-40 py-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setRenamingProject(project.id);
                        setNewProjectName(project.name);
                        setOpenMenu(null);
                      }}
                    >
                      Rename
                    </button>

                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() =>
                        duplicateProject(project.id)
                      }
                    >
                      Duplicate
                    </button>

                    <button
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                      onClick={() =>
                        deleteProject(project.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* CARD */}
              <div
                onClick={() =>
                  navigate(`/newVisualization/${project.id}`)
                }
                className="h-full flex flex-col cursor-pointer"
              >
                <div className="flex-1 bg-slate-50 border-b flex items-center justify-center">
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-slate-300">
                      📊
                    </div>
                  )}
                </div>

                <div className="p-3">
                  {renamingProject === project.id ? (
                    <input
                      autoFocus
                      value={newProjectName}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        setNewProjectName(e.target.value)
                      }
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter")
                          renameProject(project.id);

                        if (e.key === "Escape")
                          setRenamingProject(null);
                      }}
                      className="border rounded p-1 w-full"
                    />
                  ) : (
                    <div className="font-semibold truncate">
                      {project.name}
                    </div>
                  )}

                  <div className="text-xs text-gray-400">
                    Click to customize
                  </div>
                </div>
              </div>
            </div>
          ))}
          

        </div>

      </div>

    </div>
  );
}

export default BasePage;