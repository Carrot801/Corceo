const pool = require("../db");

const searchItems = async (query,userId) => {
  const searchTerm = `%${query}%`;
  
  // Use Promise.all to run both queries in parallel for better performance
  const [foldersResult, projectsResult, storiesResult] = await Promise.all([
    pool.query(
      "SELECT id, name, parent_id, 'folder' as type FROM folders WHERE LOWER(name) LIKE LOWER($1) AND user_id = $2 ORDER BY name",
      [searchTerm, userId]
    ),
    pool.query(
      "SELECT id, name, folder_id, image_url, 'project' as type FROM projects WHERE LOWER(name) LIKE LOWER($1) AND user_id = $2 ORDER BY name",
      [searchTerm, userId]
    ),
    pool.query(
      "SELECT id, name, folder_id, image_url, 'story' as type FROM stories WHERE LOWER(name) LIKE LOWER($1) AND user_id = $2 ORDER BY name",
      [searchTerm, userId]
    )
  ]);

  return {
    folders: foldersResult.rows,
    projects: projectsResult.rows,
    stories: storiesResult.rows,
  };
};

module.exports = { searchItems };