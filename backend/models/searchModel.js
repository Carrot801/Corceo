const pool = require("../db");

const searchItems = async (query) => {
  const searchTerm = `%${query}%`;
  
  // Use Promise.all to run both queries in parallel for better performance
  const [foldersResult, projectsResult] = await Promise.all([
    pool.query(
      "SELECT id, name, parent_id, 'folder' as type FROM folders WHERE LOWER(name) LIKE LOWER($1) ORDER BY name",
      [searchTerm]
    ),
    pool.query(
      "SELECT id, name, folder_id, image_url, 'project' as type FROM projects WHERE LOWER(name) LIKE LOWER($1) ORDER BY name",
      [searchTerm]
    )
  ]);

  return {
    folders: foldersResult.rows,
    projects: projectsResult.rows,
  };
};

module.exports = { searchItems };