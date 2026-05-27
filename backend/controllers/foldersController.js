const { getFolders, createFolder } = require("../models/foldersModel");

const fetchFolders = async (req, res) => {
    try {       
        const result = await getFolders();
        res.json(result);
    } catch (error) {
        console.error("Error fetching folders:", error);
        res.status(500).json({ error: "Failed to fetch folders" });
    }
};

const addFolder = async (req, res) => {
    try {
        const { name, parent_id } = req.body;
        const result = await createFolder(name, parent_id);
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error creating folder:", error);
        res.status(500).json({ error: "Failed to create folder" });
    }
};

module.exports = { fetchFolders, addFolder };