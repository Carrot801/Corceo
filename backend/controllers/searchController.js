const { searchItems } = require("../models/searchModel");
const search = async (req, res) => {
  try {
    const q = req.query.q;

    if (!q || !q.trim()) {
      return res.json({
        folders: [],
        projects: [],
      });
    }

    const result = await searchItems(q);

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Search failed",
    });
  }
};

module.exports = {search};
