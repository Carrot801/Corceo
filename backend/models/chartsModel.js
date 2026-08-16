const pool = require("../db");


// =========================================
// CREATE / UPDATE CHART
// =========================================

const createChart = async (
  req,
  res,
  next
) => {
  const client =
    await pool.connect();

  try {
    const {
      project_id,
      dataset_id,
      chart_type,
      x_axis,
      y_axis,
      settings,
      image_data,
      chart_config,
    } = req.body;

    const userId =
      req.user.userId;

    const projectId =
      Number(project_id);

    const datasetId =
      Number(dataset_id);

    // =========================
    // VALIDATION
    // =========================

    if (
      !Number.isInteger(
        projectId
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid project ID",
        });
    }

    if (
      !Number.isInteger(
        datasetId
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid dataset ID",
        });
    }

    if (
      !chart_type ||
      typeof chart_type !==
        "string"
    ) {
      return res
        .status(400)
        .json({
          error:
            "Chart type is required",
        });
    }

    await client.query(
      "BEGIN"
    );

    // =========================
    // VERIFY PROJECT OWNERSHIP
    // =========================

    const projectResult =
      await client.query(
        `
        SELECT id
        FROM projects
        WHERE id = $1
          AND user_id = $2
        `,
        [
          projectId,
          userId,
        ]
      );

    if (
      projectResult.rows.length ===
      0
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res
        .status(404)
        .json({
          error:
            "Project not found",
        });
    }

    // =========================
    // VERIFY DATASET OWNERSHIP
    // AND PROJECT RELATIONSHIP
    // =========================

    const datasetResult =
      await client.query(
        `
        SELECT id
        FROM datasets
        WHERE id = $1
          AND project_id = $2
          AND user_id = $3
        `,
        [
          datasetId,
          projectId,
          userId,
        ]
      );

    if (
      datasetResult.rows.length ===
      0
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res
        .status(404)
        .json({
          error:
            "Dataset not found",
        });
    }

    // =========================
    // CREATE / UPDATE CHART
    // =========================

    const result =
      await client.query(
        `
        INSERT INTO charts (
          project_id,
          dataset_id,
          chart_type,
          x_axis,
          y_axis,
          settings,
          chart_config,
          image_data,
          user_id
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9
        )

        ON CONFLICT (project_id)
        DO UPDATE SET
          dataset_id =
            EXCLUDED.dataset_id,

          chart_type =
            EXCLUDED.chart_type,

          x_axis =
            EXCLUDED.x_axis,

          y_axis =
            EXCLUDED.y_axis,

          settings =
            EXCLUDED.settings,

          chart_config =
            EXCLUDED.chart_config,

          image_data =
            EXCLUDED.image_data

        WHERE charts.user_id =
              EXCLUDED.user_id

        RETURNING *
        `,
        [
          projectId,
          datasetId,
          chart_type,
          x_axis ?? null,
          y_axis ?? null,
          settings ?? {},
          chart_config ?? {},
          image_data ?? null,
          userId,
        ]
      );

    /*
     * Normally ownership was already
     * verified above, but this also
     * protects the conflict update.
     */
    if (
      result.rows.length === 0
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res
        .status(404)
        .json({
          error:
            "Chart not found",
        });
    }

    // =========================
    // UPDATE PROJECT PREVIEW
    // =========================

    if (image_data) {
      await client.query(
        `
        UPDATE projects
        SET image_url = $1
        WHERE id = $2
          AND user_id = $3
        `,
        [
          image_data,
          projectId,
          userId,
        ]
      );
    }

    await client.query(
      "COMMIT"
    );

    return res.json(
      result.rows[0]
    );

  } catch (err) {
    try {
      await client.query(
        "ROLLBACK"
      );
    } catch (
      rollbackError
    ) {
      console.error(
        "Chart rollback failed:",
        rollbackError
      );
    }

    next(err);

  } finally {
    client.release();
  }
};


// =========================================
// GET CHART FOR PROJECT
// =========================================

const getCharts = async (
  req,
  res,
  next
) => {
  try {
    const {
      project_id,
    } = req.query;

    const userId =
      req.user.userId;

    const projectId =
      Number(project_id);

    if (
      !Number.isInteger(
        projectId
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid project ID",
        });
    }

    const result =
      await pool.query(
        `
        SELECT *
        FROM charts
        WHERE project_id = $1
          AND user_id = $2
        ORDER BY id DESC
        LIMIT 1
        `,
        [
          projectId,
          userId,
        ]
      );

    if (
      result.rows.length ===
      0
    ) {
      return res
        .status(404)
        .json({
          error:
            "Chart not found",
        });
    }

    return res.json(
      result.rows[0]
    );

  } catch (err) {
    next(err);
  }
};


// =========================================
// GET PUBLISHED CHART
// =========================================
const getPublishedChart = async (
  req,
  res,
  next
) => {
  try {
    const chartId = Number(
      req.params.chartId
    );

    // =========================
    // VALIDATE ID
    // =========================

    if (
      !Number.isInteger(chartId)
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid chart ID",
        });
    }

    // =========================
    // GET PUBLISHED CHART
    // =========================

    const chartResult =
      await pool.query(
        `
        SELECT
          id,
          dataset_id,
          chart_type,
          x_axis,
          y_axis,
          settings,
          chart_config,
          image_data,
          is_published

        FROM charts

        WHERE id = $1
          AND is_published = TRUE
        `,
        [chartId]
      );

    if (
      chartResult.rows.length ===
      0
    ) {
      return res
        .status(404)
        .json({
          error:
            "Chart not found or not published",
        });
    }

    const chart =
      chartResult.rows[0];

    // =========================
    // GET DATASET ROWS
    // =========================

    let rows = [];

    if (chart.dataset_id) {
      const rowsResult =
        await pool.query(
          `
          SELECT data
          FROM rows
          WHERE dataset_id = $1
          ORDER BY id
          `,
          [chart.dataset_id]
        );

      rows =
        rowsResult.rows.map(
          (row) => row.data
        );
    }

    // =========================
    // RETURN PUBLIC RESOURCE
    // =========================

    return res.json({
      chart,
      rows,
    });

  } catch (err) {
    next(err);
  }
};

// =========================================
// PUBLISH CHART
// =========================================

const publishChart = async (
  req,
  res,
  next
) => {
  try {
    const chartId =
      Number(
        req.params.chartId
      );

    const userId =
      req.user.userId;

    if (
      !Number.isInteger(
        chartId
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid chart ID",
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
        [
          chartId,
          userId,
        ]
      );

    if (
      result.rows.length ===
      0
    ) {
      return res
        .status(404)
        .json({
          error:
            "Chart not found",
        });
    }

    return res.json({
      success: true,
      chartId:
        result.rows[0].id,
    });

  } catch (error) {
    next(error);
  }
};

const getChartById = async (
  req,
  res,
  next
) => {
  try {
    const chartId =
      Number(req.params.chartId);

    const userId =
      req.user.userId;

    if (
      !Number.isInteger(chartId)
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid chart ID",
        });
    }

    const result =
      await pool.query(
        `
        SELECT *
        FROM charts
        WHERE id = $1
          AND user_id = $2
        `,
        [
          chartId,
          userId,
        ]
      );

    if (
      result.rows.length === 0
    ) {
      return res
        .status(404)
        .json({
          error:
            "Chart not found",
        });
    }

    return res.json(
      result.rows[0]
    );

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createChart,
  getCharts,
  getPublishedChart,
  publishChart,
  getChartById,
};