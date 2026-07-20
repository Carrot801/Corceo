import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./Header";
import AuthRequiredModal from "../components/AuthRequiredModal";

function BasePage() {
  const [addingFolder, setAddingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [treeProjects, setTreeProjects] = useState([]);
  const [treeStories, setTreeStories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stories, setStories] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [openFolders, setOpenFolders] = useState({});
  const [openMenu, setOpenMenu] = useState(null);
  const [renamingProject, setRenamingProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [search, setSearch] = useState("");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, folderId: null });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchResults, setSearchResults] = useState({
  folders: [],
  projects: [],
  stories: [],
});
const createProject = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: "New Project",
        folder_id: activeFolder || null,
      }),
    });

    const newProject = await res.json();

    if (!res.ok) {
      console.error("Create project failed:", newProject);
      return;
    }

    console.log("Created project:", newProject);

    setProjects((prev) => [...prev, newProject]);

    navigate(`/projects/new/${newProject.id}`);
  } catch (err) {
    console.error("Failed to create project:", err);
  }
};

const requireAuth = (destination) => {
  const token = localStorage.getItem("token");

  if (!token) {
    setShowAuthModal(true);
    return;
  }

  navigate(destination);
};


const loadTreeItemsForFolder = async (folderId) => {
  const token = localStorage.getItem("token");

  let projectUrl = "http://localhost:5000/projects";
  let storyUrl = "http://localhost:5000/stories";

  if (folderId !== null && folderId !== undefined) {
    projectUrl += `?folder_id=${folderId}`;
    storyUrl += `?folder_id=${folderId}`;
  }

  const [projectRes, storyRes] = await Promise.all([
    fetch(projectUrl, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(storyUrl, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  const projectData = await projectRes.json();
  const storyData = await storyRes.json();

  setTreeProjects(prev => [
    ...prev.filter(p => p.folder_id !== folderId),
    ...projectData,
  ]);

  setTreeStories(prev => [
    ...prev.filter(s => s.folder_id !== folderId),
    ...storyData,
  ]);
};
  const getFolders = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/folders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setFolders(data);
    await loadTreeItemsForFolder(null);
  };
  
const createFolder = async () => {

  if (!folderName.trim()) return;

  const token = localStorage.getItem("token");

  await fetch("http://localhost:5000/folders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: folderName,
      parent_id: activeFolder || null,
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

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      setProjects(data);
    } catch (err) {
      console.error("getProjects failed:", err);
    }
  };
   const getStories = async (folderId) => {
    try {
      let url = "http://localhost:5000/stories";

      if (folderId !== null && folderId !== undefined) {
        url += `?folder_id=${folderId}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      setStories(data);
    } catch (err) {
      console.error("getStories failed:", err);
    }
  };
  const toggleFolder = (id) => {
    setOpenFolders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderFolders = (parentId = null, level = 0) => {
  const currentFolders = folders.filter((f) => f.parent_id === parentId);
  const currentProjects = treeProjects.filter((p) => p.folder_id === parentId);
  const currentStories = treeStories.filter((s) => s.folder_id === parentId);
  return (
    <div className="flex flex-col">
      {currentFolders.map((folder) => (
        <div key={`folder-${folder.id}`}>
          {/* FOLDER ROW */}
          <div 
            className={`flex items-center gap-1 py-1.5 text-sm transition-colors cursor-pointer
            ${activeFolder === folder.id 
              ? "app-active"
              : "app-text-secondary app-hover"
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
          >
           <span
            onClick={(e) => {
              e.stopPropagation();

              setOpenFolders(prev => ({
                ...prev,
                [folder.id]: !prev[folder.id],
              }));

              loadTreeItemsForFolder(folder.id);
            }}
            className="w-5 flex justify-center app-text-muted cursor-pointer hover:text-gray-600"
          >
            {openFolders[folder.id] ? "▼" : "▶"}
          </span>

          <div
            className="flex-1 flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();

              setActiveFolder(folder.id);

              setOpenFolders(prev => ({
                ...prev,
                [folder.id]: true,
              }));

              loadTreeItemsForFolder(folder.id);
            }}
          >
            <span>📁</span>
            {folder.name}
          </div>
          </div>

          {/* RECURSIVE FOLDER CONTENT */}
          {openFolders[folder.id] && renderFolders(folder.id, level + 1)}
        </div>
      ))}
      {currentStories.map((story) => (
        <div
          key={`story-${story.id}`}
          onClick={() => navigate(`/newStory/${story.id}`)}
          className="cursor-pointer hover:bg-gray-100 py-1.5 text-sm flex items-center gap-2 app-text"
          style={{ paddingLeft: `${level * 16 + 10}px` }}
        >
          <span>📖</span>
          {story.name}
        </div>
      ))}

      {/* PROJECT ROWS */}
      {currentProjects.map((project) => (
        <div
          key={`project-${project.id}`}
          onClick={() => navigate(`/newVisualization/${project.id}`)}
          className={`cursor-pointer hover:bg-gray-100 py-1.5 text-sm flex items-center gap-2 app-text`}
          style={{ paddingLeft: `${(level ) * 16 +10}px` }} // Extra padding to align with children
        >
          <span>📄</span>
          {project.name}
        </div>
      ))}
    </div>
  );
};
  const renderFoldersForProjects = (parentId = null) => {
    return folders
      .filter(folder => folder.parent_id === parentId)
  };
useEffect(() => {
  const init = async () => {
    await getFolders();
    await getProjects(null);
    await getStories(null);
    await loadTreeItemsForFolder(null);
  };

  init();
}, []);


const searchItems = async (value) => {
  const res = await fetch(
    `http://localhost:5000/search?q=${encodeURIComponent(value)}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  const data = await res.json();

  setSearchResults(data);
};

useEffect(() => {
  getProjects(activeFolder);
  getStories(activeFolder);
}, [activeFolder]);

const createFolderWithParent = async (parentId) => {
  const token = localStorage.getItem("token");
  if (!folderName.trim()) return;

  await fetch("http://localhost:5000/folders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: folderName, parent_id: parentId })
  });
  
  await getFolders();
  setFolderName("");
  setContextMenu({ visible: false, x: 0, y: 0, folderId: null });
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
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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
    if (!projectId) {
      console.error("Cannot duplicate project: missing project ID");
      return;
    }

    const res = await fetch(
      `http://localhost:5000/projects/duplicate/${projectId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Duplicate project failed:", data);
      return;
    }

    if (!data?.id) {
      console.error("Duplicate response has no project ID:", data);
      return;
    }

    setProjects((prev) => [data, ...prev]);
    setTreeProjects((prev) => [data, ...prev]);
    setOpenMenu(null);
  } catch (error) {
    console.error("Duplicate project network error:", error);
  }
};
  
  const deleteProject = async (projectId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/projects/${projectId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
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
  const createStory = async () => {
  try {
    const res = await fetch("http://localhost:5000/stories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ 
        name: "Untitled Story",
        slides: [],
      folder_id: activeFolder ?? null,
     }),
    });
    const data = await res.json();


    if (data.id) {
      navigate(`/stories/new/${data.id}`);
    } else {

    console.log("Server did not return an ID:", data.id);

    }
  } catch (err) {
    console.error("Failed to initialize story:", err);
  }
};
const duplicateStory = async (storyId) => {
  try {
    const res = await fetch(
      `http://localhost:5000/stories/duplicate/${storyId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const duplicated = await res.json();

    if (!res.ok) {
      console.error("Duplicate story failed:", duplicated);
      return;
    }

    setStories((prev) => [...prev, duplicated]);
    setTreeStories((prev) => [...prev, duplicated]);
  } catch (err) {
    console.error(err);
  }
};

const deleteStory = async (storyId) => {
  try {
    const res = await fetch(`http://localhost:5000/stories/${storyId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Delete story failed:", data);
      return;
    }

    setStories((prev) => prev.filter((s) => s.id !== storyId));
    setTreeStories((prev) => prev.filter((s) => s.id !== storyId));
  } catch (err) {
    console.error(err);
  }
};

    // Determine what to display
    const isSearching = search.trim().length > 0;
    const displayedProjects = isSearching 
      ? searchResults.projects 
      : projects;

    const displayedStories = isSearching 
      ? searchResults.stories 
      : stories;

    const displayedFolders = isSearching
      ? (searchResults.folders || [])
      : (folders || []).filter(f => f.parent_id === activeFolder);


  return (
    <>
    <Header />
    <div className="app-page flex min-h-screen min-w-screen">

      <div className="app-sidebar w-[240px] border-r p-5 flex flex-col gap-4">
        <button
          onClick={createProject}
          className="btn-primary"
        >
          + New visualization
        </button>

        <button 
        onClick={(createStory)}
        className="btn-secondary"
        >
          + New story
        </button>

        <div className="mt-6 flex flex-col gap-2 text-gray-600">
            <span className="font-semibold">Projects</span>
            <button
              onClick={() => {
                setActiveFolder(null);
                loadTreeItemsForFolder(null);
              }}
              className="bg-gray-200 text-sm text-left text-gray-700 py-2 rounded"
            >
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
                  className="bg-transparent text-sm text-left app-text-muted py-2 rounded hover:text-gray-900"
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
            className="app-input w-[350px] p-3 border rounded-lg"
          />



        </div>


        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 ">

          {!isSearching && (
            <div
              className="app-create-card flex h-[280px] w-[280px] cursor-pointer items-center justify-center rounded-lg"
              onClick={createProject}
            >
              + Create project
            </div>
          )}

          {/* 2. Map through displayedFolders (either current folder or search results) */}
          {displayedFolders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => {
              setActiveFolder(folder.id);

              setOpenFolders(prev => ({
                ...prev,
                [folder.id]: true,
              }));

              loadTreeItemsForFolder(folder.id);
            }}
              className="app-card h-[280px] w-[280px] flex justify-center p-4 rounded-lg border hover:shadow cursor-pointer"
            
            >
              <div className="text-lg app-text font-semibold">
                {folder.name}
              </div>
            </div>
          ))}
          {displayedStories.map((story) => (
            <div
              key={story.id}
              className="app-card relative h-[280px] w-[280px] rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="absolute top- right-2 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenu(openMenu === `story-${story.id}` ? null : `story-${story.id}`);
                  }}
                  className="app-icon-button"
                >
                  ⋮
                </button>

                {openMenu === `story-${story.id}` && (
                  <div
                    className="app-menu absolute right-0 mt-1 w-40 rounded-lg py-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="app-menu-item"
                      onClick={() => duplicateStory(story.id)}
                    >
                      Duplicate
                    </button>

                    <button
                      className="app-menu-item app-menu-danger"
                      onClick={() => deleteStory(story.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <div
                onClick={() => navigate(`/newStory/${story.id}`)}
                className="h-full flex flex-col cursor-pointer"
              >
                <div className="flex-1 app-card  border-b flex items-center justify-center">
                  {story.image_url ? (
                    <img
                      src={story.image_url}
                      alt={story.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-slate-300 text-4xl">
                      📖
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <div className="app-text font-semibold truncate">
                    {story.name}
                  </div>

                  <div className="text-xs app-text-muted">
                    Click to edit story
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* 3. Map through displayedProjects (either current folder or search results) */}
          {displayedProjects.map((project) => (
            <div
              key={project.id}
              className="app-card relative h-[280px] w-[280px] rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* MENU */}
              <div className="absolute top-1 right-2 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenu(
                      openMenu === project.id
                        ? null
                        : project.id
                    );
                  }}
                  className="app-icon-button"
                >
                  ⋮
                </button>

                {openMenu === project.id && (
                  <div
                    className="app-menu absolute right-0 mt-1 w-40 rounded-lg py-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="app-menu-item"
                      onClick={() => {
                        setRenamingProject(project.id);
                        setNewProjectName(project.name);
                        setOpenMenu(null);
                      }}
                    >
                      Rename
                    </button>

                    <button
                      className="app-menu-item"
                      onClick={() =>
                        duplicateProject(project.id)
                      }
                    >
                      Duplicate
                    </button>

                    <button
                      className="app-menu-item app-menu-danger"
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
                <div className="app-surface flex-1 border-b flex items-center justify-center">
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.name}
                      className="w-full h-full"
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
                    <div className="app-text font-semibold truncate">
                      {project.name}
                    </div>
                  )}

                  <div className="text-xs app-text-muted">
                    Click to customize
                  </div>
                </div>
              </div>
            </div>
          ))}
          

        </div>

      </div>
      {contextMenu.visible && (
          <div
            className="app-card fixed border shadow-xl rounded-lg p-3 z-50 w-48 "
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onMouseLeave={() => setContextMenu({ ...contextMenu, visible: false })}
          >
            <div className="text-xs font-bold mb-2 app-text uppercase">New Item</div>
            <input
              autoFocus
              placeholder="Folder name..."
              className="border rounded w-full p-1 mb-2 text-sm"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // You need to ensure your createFolder function accepts a parentId
                  // logic: createFolder(contextMenu.folderId)
                  createFolderWithParent(contextMenu.folderId);
                }
              }}
            />
          </div>
        )}

      <AuthRequiredModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  </>
  );
}

export default BasePage;