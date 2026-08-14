const pool = require("../db");

const createChart = async (req, res, next) => {
const { project_id, dataset_id, chart_type, x_axis, y_axis, settings, image_data,chart_config } = req.body;  try {
  const userId = req.user.userId;  
  const result = await pool.query(
      `INSERT INTO charts (project_id, dataset_id, chart_type, x_axis, y_axis, settings, chart_config, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (project_id) DO UPDATE 
       SET dataset_id = EXCLUDED.dataset_id,
       chart_type = EXCLUDED.chart_type, 
           x_axis = EXCLUDED.x_axis, 
           y_axis = EXCLUDED.y_axis, 
           settings = EXCLUDED.settings,
           chart_config = EXCLUDED.chart_config
       RETURNING *`, 
      [project_id, dataset_id, chart_type, x_axis, y_axis, JSON.stringify(settings), JSON.stringify(chart_config), userId]
    );
    if (image_data) {
      await pool.query(
        "UPDATE projects SET image_url = $1 WHERE id = $2 AND user_id = $3",
        [image_data, project_id, userId]
      );
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const getCharts = async (req, res) => {
  const { project_id } = req.query;
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      `SELECT * FROM charts WHERE project_id = $1 AND user_id = $2 ORDER BY id DESC LIMIT 1`,
      [project_id, userId]
    );
    res.json(result.rows[0] || null); 
  } catch (err) {
    next(err);
  }
};
const getPublishedChart = async (req, res, next) => {
  try {
    const { chartId } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        dataset_id,
        chart_type,
        x_axis,
        y_axis,
        settings,
        chart_config
      FROM charts
      WHERE id = $1
      AND is_published = TRUE;
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
    next(err);
  }
};

const publishChart = async (req, res) => {
  try {
    const chartId =
      Number(req.params.chartId);

    const userId =
      req.user.userId;

    if (!Number.isInteger(chartId)) {
      return res.status(400).json({
        error: "Invalid chart ID",
      });
    }

    const result =
      await pool.query(
        `
        UPDATE charts
        SET is_published = TRUE
        WHERE id = $1
        AND user_id = $2
        RETURNING id
        `,
        [chartId, userId],
      );

    if (!result.rows.length) {
      return res.status(404).json({
        error: "Chart not found",
      });
    }

    return res.json({
      success: true,
      chartId:
        result.rows[0].id,
    });
  } catch (error) {
    console.error(
      "Publish chart error:",
      error,
    );

    return res.status(500).json({
      error:
        "Failed to publish chart",
    });
  }
};
module.exports = { 
  createChart,
  getCharts,
  getPublishedChart,
  publishChart,
 };