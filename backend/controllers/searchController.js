const { searchItems } = require("../models/searchModel");
const search = async (req, res) => {
  try {
    const q = req.query.q;
    const userId = req.user.userId;

    if (!q || !q.trim()) {
      return res.json({
        folders: [],
        projects: [],
        stories: [],
      });
    }

    const result = await searchItems(q, userId);

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Search failed",
    });
  }
};

module.exports = {search};
