const pool = require("../db");

const createChart = async (req, res) => {
const { project_id, dataset_id, chart_type, x_axis, y_axis, settings, image_data } = req.body;  try {
    const result = await pool.query(
      `INSERT INTO charts (project_id, dataset_id, chart_type, x_axis, y_axis, settings)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (project_id) DO UPDATE 
       SET chart_type = EXCLUDED.chart_type, 
           x_axis = EXCLUDED.x_axis, 
           y_axis = EXCLUDED.y_axis, 
           settings = EXCLUDED.settings
       RETURNING *`, 
      [project_id, dataset_id, chart_type, x_axis, y_axis, JSON.stringify(settings)]
    );
    if (image_data) {
      await pool.query(
        "UPDATE projects SET image_url = $1 WHERE id = $2",
        [image_data, project_id]
      );
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const getCharts = async (req, res) => {
  const { project_id } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM charts WHERE project_id = $1 LIMIT 1`,
      [project_id]
    );
    res.json(result.rows[0] || null); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chart" });
  }
};
const getPublishedChart = async (req, res) => {
  try {
    const { chartId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM charts
      WHERE id = $1
      `,
      [chartId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Chart not found",
      });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to load chart",
    });
  }
};

module.exports = { createChart, getCharts, getPublishedChart };