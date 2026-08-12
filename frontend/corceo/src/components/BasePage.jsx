import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./Header";
import AuthRequiredModal from "../components/AuthRequiredModal";
import {
  apiRequest,
} from "../api/client";

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
  const [showFavoritesOnly, setShowFavoritesOnly] =
  useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, folderId: null });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchResults, setSearchResults] = useState({
  folders: [],
  projects: [],
  stories: [],
});
const createProject = async () => {
  try {
    const res = await apiRequest("/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  try {
    let projectPath = "/projects";
    let storyPath = "/stories";

    if (folderId !== null && folderId !== undefined) {
      const query = `?folder_id=${encodeURIComponent(folderId)}`;

      projectPath += query;
      storyPath += query;
    }

    const [projectData, storyData] = await Promise.all([
      apiRequest(projectPath),
      apiRequest(storyPath),
    ]);

    setTreeProjects((previous) =>
      sortProjects([
        ...previous.filter(
          (project) =>
            project.folder_id !== folderId,
        ),
        ...projectData,
      ]),
    );

    setTreeStories((previous) => [
      ...previous.filter(
        (story) =>
          story.folder_id !== folderId,
      ),
      ...storyData,
    ]);
  } catch (err) {
    console.error(
      "Failed to load folder tree items:",
      err,
    );
  }
};

  const getFolders = async () => {
    const data =
    await apiRequest(
      "/folders",
    );
    setFolders(data);
    await loadTreeItemsForFolder(null);
  };
  
const createFolder = async () => {
  if (!folderName.trim()) return;

  try {
    await apiRequest("/folders", {
      method: "POST",
      body: JSON.stringify({
        name: folderName,
        parent_id: activeFolder || null,
      }),
    });

    await getFolders();
    setFolderName("");
    setAddingFolder(false);
  } catch (err) {
    console.error("Failed to create folder:", err);
  }
};

  const getProjects = async (folderId) => {
    try {
      let path = "/projects";

      if (folderId !== null && folderId !== undefined) {
        path += `?folder_id=${folderId}`;
      }

      const data = await apiRequest(path);

      setProjects(data);
    } catch (err) {
      console.error("getProjects failed:", err);
    }
  };
   const getStories = async (folderId) => {
    try {

      let path = "/stories";
      if (folderId !== null && folderId !== undefined) {
        path += `?folder_id=${folderId}`;
      }

      

      const data = await apiRequest(path);

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
      {currentProjects.map(
  (project) => (
    <div
      key={`project-${project.id}`}
      onClick={() =>
        navigate(
          `/newVisualization/${project.id}`,
        )
      }
      className="
        app-text
        flex
        cursor-pointer
        items-center
        gap-2
        py-1.5
        text-sm
        hover:bg-gray-100
      "
      style={{
        paddingLeft:
          `${level * 16 + 10}px`,
      }}
    >
      <button
        type="button"
        title={
          project.is_favorite
            ? "Remove from favorites"
            : "Add to favorites"
        }
        onClick={(event) => {
          event.stopPropagation();

          toggleProjectFavorite(
            project,
          );
        }}
        className="
          flex
          h-6
          w-6
          items-center
          justify-center
          rounded
          hover:bg-black/5
        "
      >
        <span
          className={
            project.is_favorite
              ? "text-amber-500"
              : "text-slate-400"
          }
        >
          {project.is_favorite
            ? "★"
            : "☆"}
        </span>
      </button>

      <span>📄</span>

      <span className="truncate">
        {project.name}
      </span>
    </div>
  ),
)}
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
  try {
    const data = await apiRequest(
      `/search?q=${encodeURIComponent(value)}`
    );

    setSearchResults(data);
  } catch (err) {
    console.error("Search failed:", err);
  }
};


useEffect(() => {
  getProjects(activeFolder);
  getStories(activeFolder);
}, [activeFolder]);

const createFolderWithParent = async (parentId) => {
  if (!folderName.trim()) return;

  try {
    await apiRequest("/folders", {
      method: "POST",
      body: JSON.stringify({
        name: folderName,
        parent_id: parentId,
      }),
    });

    await getFolders();

    setFolderName("");
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      folderId: null,
    });
  } catch (err) {
    console.error("Create folder failed:", err);
  }
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
    const data = await apiRequest(`/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: newProjectName,
      }),
    });

    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? data : project
      )
    );

    setRenamingProject(null);
    setNewProjectName("");
  } catch (err) {
    console.error("Failed to rename project:", err);
  }
};
const duplicateProject = async (projectId) => {
  try {
    if (!projectId) {
      console.error("Cannot duplicate project: missing project ID");
      return;
    }

    const data = await apiRequest(`/projects/duplicate/${projectId}`, 
      {
        method: "POST",
      }
    );

    setProjects((prev) => [data, ...prev]);
    setTreeProjects((prev) => [data, ...prev]);
    setOpenMenu(null);
  } catch (error) {
    console.error("Duplicate project network error:", error);
  }
};
  
const deleteProject = async (projectId) => {
  try {
    await apiRequest(`/projects/${projectId}`, {
      method: "DELETE",
    });

    setProjects((prev) =>
      prev.filter((project) => project.id !== projectId)
    );
  } catch (err) {
    console.error("Failed to delete project:", err);
  }
};

  const createStory = async () => {
  try {
    const data = await apiRequest("/stories", {
      method: "POST",
      body: JSON.stringify({ 
        name: "Untitled Story",
        slides: [],
      folder_id: activeFolder ?? null,
     }),
    });


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
    const duplicated = await apiRequest(`/stories/duplicate/${storyId}`, {
      method: "POST",
    });


    setStories((prev) => [...prev, duplicated]);
    setTreeStories((prev) => [...prev, duplicated]);
  } catch (err) {
    console.error(err);
  }
};

const sortProjects = (projectList) => {
  return [...projectList].sort(
    (first, second) => {
      const favoriteDifference =
        Number(Boolean(second.is_favorite)) -
        Number(Boolean(first.is_favorite));

      if (favoriteDifference !== 0) {
        return favoriteDifference;
      }

      return Number(second.id) -
        Number(first.id);
    },
  );
};
const toggleProjectFavorite = async (
  project,
) => {
  const nextFavorite =
    !Boolean(project.is_favorite);

  /*
   * Optimistic update:
   * change the star immediately.
   */
  const updateLocalProject = (
    projectList,
    favoriteValue,
  ) =>
    sortProjects(
      projectList.map((item) =>
        item.id === project.id
          ? {
              ...item,
              is_favorite:
                favoriteValue,
            }
          : item,
      ),
    );

  setProjects((previous) =>
    updateLocalProject(
      previous,
      nextFavorite,
    ),
  );

  setTreeProjects((previous) =>
    updateLocalProject(
      previous,
      nextFavorite,
    ),
  );

  setSearchResults((previous) => ({
    ...previous,

    projects: updateLocalProject(
      previous.projects || [],
      nextFavorite,
    ),
  }));

  try {
  const updatedProject = await apiRequest(
    `/projects/${project.id}/favorite`,
    {
      method: "PATCH",
      body: JSON.stringify({
        is_favorite: nextFavorite,
      }),
    },
  );

    const applyServerProject = (
      projectList,
    ) =>
      sortProjects(
        projectList.map((item) =>
          item.id ===
          updatedProject.id
            ? updatedProject
            : item,
        ),
      );

    setProjects(applyServerProject);
    setTreeProjects(
      applyServerProject,
    );

    setSearchResults(
      (previous) => ({
        ...previous,

        projects:
          applyServerProject(
            previous.projects || [],
          ),
      }),
    );
  } catch (error) {
    console.error(
      "Favorite update failed:",
      error,
    );
    setProjects((previous) =>
      updateLocalProject(
        previous,
        Boolean(
          project.is_favorite,
        ),
      ),
    );

    setTreeProjects((previous) =>
      updateLocalProject(
        previous,
        Boolean(
          project.is_favorite,
        ),
      ),
    );

    setSearchResults(
      (previous) => ({
        ...previous,

        projects:
          updateLocalProject(
            previous.projects || [],
            Boolean(
              project.is_favorite,
            ),
          ),
      }),
    );
  }
};

const deleteStory = async (storyId) => {
  try {
    await apiRequest(`/stories/${storyId}`, {
      method: "DELETE",
    });

    setStories((prev) =>
      prev.filter((story) => story.id !== storyId)
    );

    setTreeStories((prev) =>
      prev.filter((story) => story.id !== storyId)
    );
  } catch (err) {
    console.error("Failed to delete story:", err);
  }
};
    const isSearching = search.trim().length > 0;
    const projectSource =
      isSearching
        ? searchResults.projects
        : projects;

    const displayedProjects =
      showFavoritesOnly
        ? projectSource.filter(
            (project) =>
              Boolean(
                project.is_favorite,
              ),
          )
        : projectSource;

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
        <button
          type="button"
          onClick={() => {
            setShowFavoritesOnly(
              (current) => !current,
            );
          }}
          className={
            showFavoritesOnly
              ? "app-active rounded  text-left text-sm"
              : "app-hover rounded text-left text-sm"
          }
        >
          ★ Favorites
        </button>
        <div className="flex flex-col gap-2 text-gray-600">
            
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
              className="
                app-card
                relative
                h-[280px]
                w-[280px]
                overflow-hidden
                rounded-lg
                border
                transition-shadow
                hover:shadow-md
              "
            >
              <button
                type="button"
                aria-label={
                  project.is_favorite
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
                title={
                  project.is_favorite
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
                onClick={(event) => {
                  event.stopPropagation();

                  toggleProjectFavorite(
                    project,
                  );
                }}
                className="
                  absolute
                  left-2
                  top-2
                  z-30
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  text-xl
                  shadow-sm
                  transition
                  hover:bg-white
                "
              >
                <span
                  className={
                    project.is_favorite
                      ? "text-amber-500"
                      : "text-slate-400"
                  }
                >
                  {project.is_favorite
                    ? "★"
                    : "☆"}
                </span>
              </button>

              {/* Existing menu and card */}
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
                <div className="flex-1 app-card  border-b flex items-center justify-center">
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
            onMouseLeave={() =>
              setContextMenu((prev) => ({
                ...prev,
                visible: false,
              }))
            }
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