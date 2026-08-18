const pool = require("../db");

// ==========================================
// GET STORIES
// ==========================================

async function getStories({
  userId,
  folderId = null,
}) {
  if (folderId) {
    const result = await pool.query(
      `
        SELECT *
        FROM stories
        WHERE user_id = $1
          AND folder_id = $2
        ORDER BY id DESC
      `,
      [userId, folderId]
    );

    return result.rows;
  }

  const result = await pool.query(
    `
      SELECT *
      FROM stories
      WHERE user_id = $1
        AND folder_id IS NULL
      ORDER BY id DESC
    `,
    [userId]
  );

  return result.rows;
}

// ==========================================
// GET STORY
// ==========================================

async function getStory({
  storyId,
  userId,
}) {
  const storyResult =
    await pool.query(
      `
        SELECT *
        FROM stories
        WHERE id = $1
          AND user_id = $2
      `,
      [storyId, userId]
    );

  if (
    storyResult.rows.length === 0
  ) {
    return null;
  }

  const slidesResult =
    await pool.query(
      `
        SELECT
          s.id AS slide_id,
          s.position AS slide_position,
          s.description,

          sc.id AS slide_content_id,
          sc.chart_id,
          sc.position AS content_position,
          sc.layout,

          p.name AS chart_name,
          p.image_url AS chart_image_url

        FROM slides s

        LEFT JOIN slide_content sc
          ON sc.slide_id = s.id

        LEFT JOIN charts c
          ON c.id = sc.chart_id

        LEFT JOIN projects p
          ON p.id = c.project_id

        WHERE s.story_id = $1

        ORDER BY
          s.position,
          sc.position
      `,
      [storyId]
    );

  const annotationsResult =
    await pool.query(
      `
        SELECT
          sa.slide_id,
          sa.annotation

        FROM slide_annotations sa

        JOIN slides s
          ON s.id = sa.slide_id

        WHERE s.story_id = $1
      `,
      [storyId]
    );

  const slidesMap = {};

  slidesResult.rows.forEach(
    (row) => {
      if (
        !slidesMap[row.slide_id]
      ) {
        slidesMap[row.slide_id] = {
          id: row.slide_id,

          description:
            row.description,

          content: [],

          annotations: [],
        };
      }

      if (!row.chart_id) {
        return;
      }

      slidesMap[
        row.slide_id
      ].content.push({
        id:
          row.slide_content_id ??
          `${row.slide_id}-${row.chart_id}`,

        type: "chart",

        chartId:
          row.chart_id,

        name:
          row.chart_name ||
          "Chart",

        imageUrl:
          row.chart_image_url ||
          null,

        x: Number(
          row.layout?.x ?? 0
        ),

        y: Number(
          row.layout?.y ?? 0
        ),

        width: Number(
          row.layout?.width ?? 100
        ),

        height: Number(
          row.layout?.height ?? 100
        ),

        zIndex: Number(
          row.layout?.zIndex ??
            row.content_position + 1
        ),
      });
    }
  );

  annotationsResult.rows.forEach(
    (row) => {
      if (
        slidesMap[row.slide_id]
      ) {
        slidesMap[
          row.slide_id
        ].annotations.push(
          row.annotation
        );
      }
    }
  );

  return {
    ...storyResult.rows[0],

    slides:
      Object.values(
        slidesMap
      ),
  };
}

// ==========================================
// PUBLISH STORY
// ==========================================

async function publishStory({
  storyId,
  userId,
}) {
  const result =
    await pool.query(
      `
        UPDATE stories

        SET is_published = TRUE

        WHERE id = $1
          AND user_id = $2

        RETURNING id
      `,
      [storyId, userId]
    );

  return (
    result.rows[0] || null
  );
}

async function createStory({
  userId,
  name,
  slides,
  folderId: rawFolderId = null,
  imageUrl = null,
}) {
  const client =
    await pool.connect();

  try {
    await client.query(
      "BEGIN"
    );

    // =========================
    // VALIDATE FOLDER
    // =========================

    let folderId = null;

    if (
      rawFolderId !== null &&
      rawFolderId !== undefined
    ) {
      folderId =
        Number(
          rawFolderId
        );

      if (
        !Number.isInteger(
          folderId
        )
      ) {
        const error =
          new Error(
            "Invalid folder ID"
          );

        error.statusCode =
          400;

        throw error;
      }

      const folderResult =
        await client.query(
          `
            SELECT id
            FROM folders
            WHERE id = $1
              AND user_id = $2
          `,
          [
            folderId,
            userId,
          ]
        );

      if (
        folderResult.rows.length ===
        0
      ) {
        const error =
          new Error(
            "Folder not found"
          );

        error.statusCode =
          404;

        throw error;
      }
    }

    // =========================
    // CREATE STORY
    // =========================

    const storyResult =
      await client.query(
        `
          INSERT INTO stories (
            name,
            user_id,
            folder_id,
            image_url
          )
          VALUES (
            $1,
            $2,
            $3,
            $4
          )
          RETURNING id
        `,
        [
          name,
          userId,
          folderId,
          imageUrl,
        ]
      );

    const storyId =
      storyResult.rows[0].id;

    // =========================
    // CREATE SLIDES
    // =========================

    for (
      let slideIndex = 0;
      slideIndex <
      slides.length;
      slideIndex++
    ) {
      const slide =
        slides[
          slideIndex
        ];

      const slideResult =
        await client.query(
          `
            INSERT INTO slides (
              story_id,
              position,
              description,
              user_id
            )
            VALUES (
              $1,
              $2,
              $3,
              $4
            )
            RETURNING id
          `,
          [
            storyId,
            slideIndex,
            slide.description ||
              "",
            userId,
          ]
        );

      const slideId =
        slideResult.rows[0].id;

      // =========================
      // CREATE CHART CONTENT
      // =========================

      if (
        Array.isArray(
          slide.content
        )
      ) {
        for (
          let contentIndex = 0;
          contentIndex <
          slide.content.length;
          contentIndex++
        ) {
          const item =
            slide.content[
              contentIndex
            ];

          await client.query(
            `
              INSERT INTO slide_content (
                slide_id,
                chart_id,
                position,
                layout,
                user_id
              )
              VALUES (
                $1,
                $2,
                $3,
                $4::jsonb,
                $5
              )
            `,
            [
              slideId,

              item.chartId,

              contentIndex,

              JSON.stringify({
                x:
                  Number(
                    item.x ??
                      0
                  ),

                y:
                  Number(
                    item.y ??
                      0
                  ),

                width:
                  Number(
                    item.width ??
                      100
                  ),

                height:
                  Number(
                    item.height ??
                      100
                  ),

                zIndex:
                  Number(
                    item.zIndex ??
                      contentIndex +
                        1
                  ),
              }),

              userId,
            ]
          );
        }
      }

      // =========================
      // CREATE ANNOTATIONS
      // =========================

      if (
        Array.isArray(
          slide.annotations
        )
      ) {
        for (
          let annotationIndex = 0;
          annotationIndex <
          slide.annotations.length;
          annotationIndex++
        ) {
          const annotation =
            slide.annotations[
              annotationIndex
            ];

          await client.query(
            `
              INSERT INTO slide_annotations (
                slide_id,
                annotation,
                user_id
              )
              VALUES (
                $1,
                $2,
                $3
              )
            `,
            [
              slideId,

              JSON.stringify(
                annotation
              ),

              userId,
            ]
          );
        }
      }
    }

    // =========================
    // SUCCESS
    // =========================

    await client.query(
      "COMMIT"
    );

    return {
      id:
        storyId,
    };

  } catch (error) {
    try {
      await client.query(
        "ROLLBACK"
      );
    } catch (
      rollbackError
    ) {
      console.error(
        "Create story rollback failed:",
        rollbackError
      );
    }

    throw error;

  } finally {
    client.release();
  }
}

async function updateStory({
  storyId,
  userId,
  name,
  slides,
  imageUrl = null,
}) {
  const client =
    await pool.connect();

  try {
    await client.query(
      "BEGIN"
    );

    // =========================
    // VERIFY + UPDATE STORY
    // =========================

    const storyUpdate =
      await client.query(
        `
          UPDATE stories

          SET
            name = $1,
            image_url = $4

          WHERE id = $2
            AND user_id = $3

          RETURNING id
        `,
        [
          name,
          storyId,
          userId,
          imageUrl,
        ]
      );

    if (
      storyUpdate.rows.length ===
      0
    ) {
      const error =
        new Error(
          "Story not found"
        );

      error.statusCode =
        404;

      throw error;
    }

    // =========================
    // DELETE OLD ANNOTATIONS
    // =========================

    await client.query(
      `
        DELETE FROM slide_annotations

        WHERE slide_id IN (
          SELECT id
          FROM slides

          WHERE story_id = $1
            AND user_id = $2
        )
      `,
      [
        storyId,
        userId,
      ]
    );

    // =========================
    // DELETE OLD SLIDES
    // =========================

    await client.query(
      `
        DELETE FROM slides

        WHERE story_id = $1
          AND user_id = $2
      `,
      [
        storyId,
        userId,
      ]
    );

    // =========================
    // RECREATE SLIDES
    // =========================

    for (
      let slideIndex = 0;
      slideIndex <
      slides.length;
      slideIndex++
    ) {
      const slide =
        slides[slideIndex];

      const slideResult =
        await client.query(
          `
            INSERT INTO slides (
              story_id,
              position,
              description,
              user_id
            )

            VALUES (
              $1,
              $2,
              $3,
              $4
            )

            RETURNING id
          `,
          [
            storyId,
            slideIndex,

            slide.description ||
              "",

            userId,
          ]
        );

      const slideId =
        slideResult.rows[0].id;

      // =========================
      // RECREATE CHART CONTENT
      // =========================

      if (
        Array.isArray(
          slide.content
        )
      ) {
        for (
          let contentIndex = 0;
          contentIndex <
          slide.content.length;
          contentIndex++
        ) {
          const item =
            slide.content[
              contentIndex
            ];

          await client.query(
            `
              INSERT INTO slide_content (
                slide_id,
                chart_id,
                position,
                layout,
                user_id
              )

              VALUES (
                $1,
                $2,
                $3,
                $4::jsonb,
                $5
              )
            `,
            [
              slideId,

              item.chartId,

              contentIndex,

              JSON.stringify({
                x:
                  Number(
                    item.x ??
                      0
                  ),

                y:
                  Number(
                    item.y ??
                      0
                  ),

                width:
                  Number(
                    item.width ??
                      100
                  ),

                height:
                  Number(
                    item.height ??
                      100
                  ),

                zIndex:
                  Number(
                    item.zIndex ??
                      contentIndex +
                        1
                  ),
              }),

              userId,
            ]
          );
        }
      }

      // =========================
      // RECREATE ANNOTATIONS
      // =========================

      if (
        Array.isArray(
          slide.annotations
        )
      ) {
        for (
          const annotation
          of slide.annotations
        ) {
          await client.query(
            `
              INSERT INTO slide_annotations (
                slide_id,
                annotation,
                user_id
              )

              VALUES (
                $1,
                $2,
                $3
              )
            `,
            [
              slideId,

              JSON.stringify(
                annotation
              ),

              userId,
            ]
          );
        }
      }
    }

    // =========================
    // COMMIT
    // =========================

    await client.query(
      "COMMIT"
    );

    return {
      id:
        Number(storyId),
    };

  } catch (error) {
    try {
      await client.query(
        "ROLLBACK"
      );
    } catch (
      rollbackError
    ) {
      console.error(
        "Update story rollback failed:",
        rollbackError
      );
    }

    throw error;

  } finally {
    client.release();
  }
}

async function getPublicStory({
  storyId,
}) {
  // =========================
  // STORY
  // =========================

  const storyResult =
    await pool.query(
      `
        SELECT
          id,
          name,
          image_url,
          created_at,
          is_published

        FROM stories

        WHERE id = $1
          AND is_published = TRUE
      `,
      [storyId]
    );

  if (
    storyResult.rows.length ===
    0
  ) {
    return null;
  }

  // =========================
  // SLIDES + CONTENT
  // =========================

  const slidesResult =
    await pool.query(
      `
        SELECT
          s.id AS slide_id,
          s.position AS slide_position,
          s.description,

          sc.id AS slide_content_id,
          sc.chart_id,
          sc.position AS content_position,
          sc.layout,

          p.name AS chart_name

        FROM slides s

        LEFT JOIN slide_content sc
          ON sc.slide_id = s.id

        LEFT JOIN charts c
          ON c.id = sc.chart_id

        LEFT JOIN projects p
          ON p.id = c.project_id

        WHERE s.story_id = $1

        ORDER BY
          s.position,
          sc.position
      `,
      [storyId]
    );

  // =========================
  // ANNOTATIONS
  // =========================

  const annotationsResult =
    await pool.query(
      `
        SELECT
          sa.slide_id,
          sa.annotation

        FROM slide_annotations sa

        JOIN slides s
          ON s.id =
             sa.slide_id

        WHERE s.story_id = $1
      `,
      [storyId]
    );

  // =========================
  // CHART IDS
  // =========================

  const chartIds = [
    ...new Set(
      slidesResult.rows
        .map(
          (row) =>
            row.chart_id
        )
        .filter(
          (id) =>
            id != null
        )
    ),
  ];

  let charts = [];

  // =========================
  // CHART CONFIGURATION
  // =========================

  if (
    chartIds.length > 0
  ) {
    const chartsResult =
      await pool.query(
        `
          SELECT
            c.id,
            c.dataset_id,
            c.chart_type,
            c.x_axis,
            c.y_axis,
            c.settings,
            c.chart_config

          FROM charts c

          WHERE c.id =
            ANY($1::int[])

            AND EXISTS (
              SELECT 1

              FROM slide_content sc

              JOIN slides s
                ON s.id =
                   sc.slide_id

              JOIN stories st
                ON st.id =
                   s.story_id

              WHERE
                sc.chart_id =
                  c.id

                AND st.id =
                  $2

                AND
                  st.is_published =
                    TRUE
            )
        `,
        [
          chartIds,
          storyId,
        ]
      );

    charts =
      chartsResult.rows;
  }

  // =========================
  // DATASETS
  // =========================

  const datasetIds = [
    ...new Set(
      charts
        .map(
          (chart) =>
            chart.dataset_id
        )
        .filter(
          (id) =>
            id != null
        )
    ),
  ];

  let rawRows = [];

  // =========================
  // DATASET ROWS
  // =========================

  if (
    datasetIds.length > 0
  ) {
    const rowsResult =
      await pool.query(
        `
          SELECT
            dataset_id,
            data

          FROM rows

          WHERE dataset_id =
            ANY($1::int[])

          ORDER BY id
        `,
        [
          datasetIds,
        ]
      );

    rawRows =
      rowsResult.rows;
  }

  // =========================
  // GROUP ROWS
  // =========================

  const rowsByDataset = {};

  rawRows.forEach(
    (row) => {
      if (
        !rowsByDataset[
          row.dataset_id
        ]
      ) {
        rowsByDataset[
          row.dataset_id
        ] = [];
      }

      rowsByDataset[
        row.dataset_id
      ].push(
        row.data
      );
    }
  );

  // =========================
  // GROUP CHARTS
  // =========================

  const chartsById = {};

  charts.forEach(
    (chart) => {
      chartsById[
        chart.id
      ] = {
        ...chart,

        rows:
          rowsByDataset[
            chart.dataset_id
          ] || [],
      };
    }
  );

  // =========================
  // BUILD SLIDES
  // =========================

  const slidesMap = {};

  slidesResult.rows.forEach(
    (row) => {
      if (
        !slidesMap[
          row.slide_id
        ]
      ) {
        slidesMap[
          row.slide_id
        ] = {
          id:
            row.slide_id,

          description:
            row.description,

          content: [],

          annotations: [],
        };
      }

      if (!row.chart_id) {
        return;
      }

      const chart =
        chartsById[
          row.chart_id
        ];

      if (!chart) {
        return;
      }

      slidesMap[
        row.slide_id
      ].content.push({
        id:
          row.slide_content_id ??
          `${row.slide_id}-${row.chart_id}`,

        type:
          "chart",

        chartId:
          row.chart_id,

        name:
          row.chart_name ||
          "Chart",

        // Public data needed by
        // StoryChart without private APIs.
        chart,

        rows:
          chart.rows || [],

        x:
          Number(
            row.layout?.x ??
              0
          ),

        y:
          Number(
            row.layout?.y ??
              0
          ),

        width:
          Number(
            row.layout?.width ??
              100
          ),

        height:
          Number(
            row.layout?.height ??
              100
          ),

        zIndex:
          Number(
            row.layout?.zIndex ??
              row.content_position +
                1
          ),
      });
    }
  );

  // =========================
  // ADD ANNOTATIONS
  // =========================

  annotationsResult.rows.forEach(
    (row) => {
      if (
        slidesMap[
          row.slide_id
        ]
      ) {
        slidesMap[
          row.slide_id
        ].annotations.push(
          row.annotation
        );
      }
    }
  );

  // =========================
  // RESULT
  // =========================

  return {
    ...storyResult.rows[0],

    slides:
      Object.values(
        slidesMap
      ),
  };
}

async function duplicateStory({
  storyId,
  userId,
}) {
  const client =
    await pool.connect();

  try {
    await client.query(
      "BEGIN"
    );

    // =========================
    // DUPLICATE STORY
    // =========================

    const storyResult =
      await client.query(
        `
          INSERT INTO stories (
            name,
            folder_id,
            user_id,
            image_url
          )

          SELECT
            name || ' Copy',
            folder_id,
            user_id,
            image_url

          FROM stories

          WHERE id = $1
            AND user_id = $2

          RETURNING *
        `,
        [
          storyId,
          userId,
        ]
      );

    if (
      storyResult.rows.length ===
      0
    ) {
      const error =
        new Error(
          "Story not found"
        );

      error.statusCode =
        404;

      throw error;
    }

    const newStory =
      storyResult.rows[0];

    // =========================
    // ORIGINAL SLIDES
    // =========================

    const slidesResult =
      await client.query(
        `
          SELECT *

          FROM slides

          WHERE story_id = $1
            AND user_id = $2

          ORDER BY position
        `,
        [
          storyId,
          userId,
        ]
      );

    // =========================
    // DUPLICATE SLIDES
    // =========================

    for (
      const slide
      of slidesResult.rows
    ) {
      const newSlideResult =
        await client.query(
          `
            INSERT INTO slides (
              story_id,
              position,
              description,
              user_id
            )

            VALUES (
              $1,
              $2,
              $3,
              $4
            )

            RETURNING id
          `,
          [
            newStory.id,

            slide.position,

            slide.description,

            userId,
          ]
        );

      const newSlideId =
        newSlideResult
          .rows[0]
          .id;

      // =========================
      // DUPLICATE CONTENT
      // =========================

      await client.query(
        `
          INSERT INTO slide_content (
            slide_id,
            chart_id,
            position,
            layout,
            user_id
          )

          SELECT
            $1,
            chart_id,
            position,
            layout,
            user_id

          FROM slide_content

          WHERE slide_id = $2
            AND user_id = $3
        `,
        [
          newSlideId,
          slide.id,
          userId,
        ]
      );

      // =========================
      // DUPLICATE ANNOTATIONS
      // =========================

      await client.query(
        `
          INSERT INTO slide_annotations (
            slide_id,
            annotation,
            user_id
          )

          SELECT
            $1,
            annotation,
            user_id

          FROM slide_annotations

          WHERE slide_id = $2
            AND user_id = $3
        `,
        [
          newSlideId,
          slide.id,
          userId,
        ]
      );
    }

    // =========================
    // SUCCESS
    // =========================

    await client.query(
      "COMMIT"
    );

    return newStory;

  } catch (error) {
    try {
      await client.query(
        "ROLLBACK"
      );
    } catch (
      rollbackError
    ) {
      console.error(
        "Duplicate story rollback failed:",
        rollbackError
      );
    }

    throw error;

  } finally {
    client.release();
  }
}
async function setStoryFavorite({
  storyId,
  userId,
  isFavorite,
}) {
  const result =
    await pool.query(
      `
        UPDATE stories

        SET is_favorite = $1

        WHERE id = $2
          AND user_id = $3

        RETURNING *
      `,
      [
        isFavorite,
        storyId,
        userId,
      ]
    );

  return (
    result.rows[0] ||
    null
  );
}

module.exports = {
  createStory,
  updateStory,

  getStories,
  getStory,
  getPublicStory,

  publishStory,

  duplicateStory,

  setStoryFavorite
};