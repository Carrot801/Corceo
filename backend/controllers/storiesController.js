const pool = require("../db");

const storyService =
  require("../services/storyService");
const createStory = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      slides,
      folder_id,
      image_url,
    } = req.body;

    const userId =
      req.user.userId;

    // =========================
    // BASIC VALIDATION
    // =========================

    if (
      !Array.isArray(
        slides
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            "Slides must be an array",
        });
    }

    const story =
      await storyService.createStory({
        userId,

        name,

        slides,

        folderId:
          folder_id,

        imageUrl:
          image_url,
      });

    return res.json({
      id:
        story.id,

      message:
        "Story created successfully",
    });

  } catch (error) {
    if (
      error.statusCode
    ) {
      return res
        .status(
          error.statusCode
        )
        .json({
          error:
            error.message,
        });
    }

    next(error);
  }
};

const updateStory = async (
  req,
  res,
  next
) => {
  try {
    const storyId =
      Number(
        req.params.storyId
      );

    const userId =
      req.user.userId;

    const {
      name,
      slides,
      image_url,
    } = req.body;

    // =========================
    // VALIDATION
    // =========================

    if (
      !Number.isInteger(
        storyId
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid storyId",
        });
    }

    if (
      !Array.isArray(
        slides
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            "Slides must be an array",
        });
    }

    await storyService.updateStory({
      storyId,
      userId,

      name,
      slides,

      imageUrl:
        image_url ??
        null,
    });

    return res.json({
      message:
        "Story updated successfully",
    });

  } catch (error) {
    if (
      error.statusCode
    ) {
      return res
        .status(
          error.statusCode
        )
        .json({
          error:
            error.message,
        });
    }

    next(error);
  }
};



const getStories = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      req.user.userId;

    const folderId =
      req.query.folder_id ||
      null;

    const stories =
      await storyService.getStories({
        userId,
        folderId,
      });

    return res.json(
      stories
    );
  } catch (error) {
    next(error);
  }
};
const getStory = async (
  req,
  res,
  next
) => {
  try {
    const storyId =
      Number(req.params.id);

    const userId =
      req.user.userId;

    if (
      !Number.isInteger(
        storyId
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid story ID",
        });
    }

    const story =
      await storyService.getStory({
        storyId,
        userId,
      });

    if (!story) {
      return res
        .status(404)
        .json({
          error:
            "Story not found",
        });
    }

    return res.json(
      story
    );
  } catch (error) {
    next(error);
  }
};

const getPublicStory = async (
  req,
  res,
  next
) => {
  try {
    const storyId =
      Number(
        req.params.id
      );

    if (
      !Number.isInteger(
        storyId
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid story ID",
        });
    }

    const story =
      await storyService
        .getPublicStory({
          storyId,
        });

    if (!story) {
      return res
        .status(404)
        .json({
          error:
            "Story not found or not published",
        });
    }

    return res.json(
      story
    );

  } catch (error) {
    next(error);
  }
};




const publishStory = async (
  req,
  res,
  next
) => {
  try {
    const storyId =
      Number(
        req.params.storyId
      );

    const userId =
      req.user.userId;

    if (
      !Number.isInteger(
        storyId
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid story ID",
        });
    }

    const story =
      await storyService.publishStory({
        storyId,
        userId,
      });

    if (!story) {
      return res
        .status(404)
        .json({
          error:
            "Story not found",
        });
    }

    return res.json({
      message:
        "Story published",

      url:
        `/publishedStory/${storyId}`,
    });
  } catch (error) {
    next(error);
  }
};

const duplicateStory = async (
  req,
  res,
  next
) => {
  try {
    const storyId =
      Number(
        req.params.id
      );

    const userId =
      req.user.userId;

    if (
      !Number.isInteger(
        storyId
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid story ID",
        });
    }

    const duplicatedStory =
      await storyService
        .duplicateStory({
          storyId,
          userId,
        });

    return res.json(
      duplicatedStory
    );

  } catch (error) {
    if (
      error.statusCode
    ) {
      return res
        .status(
          error.statusCode
        )
        .json({
          error:
            error.message,
        });
    }

    next(error);
  }
};
const deleteStory = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const userId = req.user.userId;
    const storyId = req.params.id;

    if (!storyId || Number.isNaN(Number(storyId))) {
      return res.status(400).json({
        error: "Invalid story ID",
      });
    }

    await client.query("BEGIN");

    const storyCheck = await client.query(
      `
      SELECT id
      FROM stories
      WHERE id = $1
        AND user_id = $2
      `,
      [storyId, userId]
    );

    if (storyCheck.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Story not found",
      });
    }

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
      [storyId, userId]
    );

    await client.query(
      `
      DELETE FROM slide_content
      WHERE slide_id IN (
        SELECT id
        FROM slides
        WHERE story_id = $1
          AND user_id = $2
      )
      `,
      [storyId, userId]
    );

    await client.query(
      `
      DELETE FROM slides
      WHERE story_id = $1
        AND user_id = $2
      `,
      [storyId, userId]
    );

    const deletedStory = await client.query(
      `
      DELETE FROM stories
      WHERE id = $1
        AND user_id = $2
      RETURNING id
      `,
      [storyId, userId]
    );

    await client.query("COMMIT");

    return res.json({
      success: true,
      deletedStoryId: deletedStory.rows[0].id,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    next(error);
  } finally {
    client.release();
  }
};

const duplicateSlide = async (req, res, next) => {
  const { storyId, slideId } = req.params;
  const userId = req.user.userId;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const slideRes = await client.query(
      `
      SELECT id, position, description
      FROM slides
      WHERE id = $1
      AND story_id = $2
      AND user_id = $3
      `,
      [slideId, storyId, userId]
    );

    if (slideRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Slide not found" });
    }

    const originalSlide = slideRes.rows[0];
    const newPosition = originalSlide.position + 1;

    await client.query(
      `
      UPDATE slides
      SET position = position + 1
      WHERE story_id = $1
      AND user_id = $2
      AND position >= $3
      `,
      [storyId, userId, newPosition]
    );

    const newSlideRes = await client.query(
      `
      INSERT INTO slides (story_id, position, description, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, position, description
      `,
      [storyId, newPosition, originalSlide.description || "", userId]
    );

    const newSlide = newSlideRes.rows[0];

    const contentRes = await client.query(
      `
      SELECT chart_id, position, layout
      FROM slide_content
      WHERE slide_id = $1
      AND user_id = $2
      ORDER BY position
      `,
      [slideId, userId]
    );

    for (const item of contentRes.rows) {
      await client.query(
        `
        INSERT INTO slide_content (slide_id, chart_id, position, layout, user_id)
        VALUES ($1, $2, $3, $4::jsonb, $5)
        `,
        [
          newSlide.id,
          item.chart_id,
          item.position,
          JSON.stringify(
            item.layout || {
              x: 0,
              y: 0,
              width: 100,
              height: 100,
              zIndex: item.position + 1,
            }
          ),
          userId,
        ]
      );
    }

    const annotationsRes = await client.query(
      `
      SELECT annotation
      FROM slide_annotations
      WHERE slide_id = $1
      AND user_id = $2
      `,
      [slideId, userId]
    );

    const copiedAnnotations = annotationsRes.rows.map(row => ({
      ...row.annotation,
      id: `anno-${Date.now()}-${Math.random()}`
    }));

    for (const anno of copiedAnnotations) {
      await client.query(
        `
        INSERT INTO slide_annotations (slide_id, annotation, user_id)
        VALUES ($1, $2, $3)
        `,
        [newSlide.id, JSON.stringify(anno), userId]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      slide: {
        id: newSlide.id,
        position: newSlide.position,
        description:
          newSlide.description || "",

        content: contentRes.rows.map(
          (item, index) => ({
            id: `${newSlide.id}-${item.chart_id}-${index}`,
            type: "chart",
            chartId: item.chart_id,
            name: "",

            x: Number(item.layout?.x ?? 0),
            y: Number(item.layout?.y ?? 0),
            width: Number(
              item.layout?.width ?? 100,
            ),
            height: Number(
              item.layout?.height ?? 100,
            ),
            zIndex: Number(
              item.layout?.zIndex ??
              index + 1,
            ),
          }),
        ),

        annotations: copiedAnnotations,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};
const deleteSlide = async (
  req,
  res,
  next
) => {
  const {
    storyId,
    slideId,
  } = req.params;

  const userId =
    req.user.userId;

  const client =
    await pool.connect();

  try {
    await client.query(
      "BEGIN"
    );

    // =========================
    // FIND SLIDE
    // =========================

    const slideCheck =
      await client.query(
        `
        SELECT
          id,
          position
        FROM slides
        WHERE id = $1
          AND story_id = $2
          AND user_id = $3
        `,
        [
          slideId,
          storyId,
          userId,
        ]
      );

    if (
      slideCheck.rows.length ===
      0
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res
        .status(404)
        .json({
          error:
            "Slide not found",
        });
    }

    const deletedPosition =
      slideCheck.rows[0]
        .position;

    // =========================
    // DELETE SLIDE
    // =========================

    /*
     * Because slide_content and
     * slide_annotations should cascade,
     * deleting the slide is enough if
     * your FK schema is configured.
     */

    await client.query(
      `
      DELETE FROM slides
      WHERE id = $1
        AND story_id = $2
        AND user_id = $3
      `,
      [
        slideId,
        storyId,
        userId,
      ]
    );

    // =========================
    // SHIFT POSITIONS SAFELY
    // =========================

    /*
     * Only slides AFTER the deleted
     * position need to move.
     *
     * We first move them temporarily
     * far away so the UNIQUE constraint
     * cannot collide.
     */

    await client.query(
      `
      UPDATE slides
      SET position =
        position + 1000000
      WHERE story_id = $1
        AND user_id = $2
        AND position > $3
      `,
      [
        storyId,
        userId,
        deletedPosition,
      ]
    );

    /*
     * Move them back down by one.
     *
     * Original:
     * 2 → 1000002 → 1
     * 3 → 1000003 → 2
     */
    await client.query(
      `
      UPDATE slides
      SET position =
        position - 1000001
      WHERE story_id = $1
        AND user_id = $2
        AND position >
          1000000
      `,
      [
        storyId,
        userId,
      ]
    );

    await client.query(
      "COMMIT"
    );

    return res.json({
      success: true,

      deletedSlideId:
        Number(slideId),
    });

  } catch (err) {
    try {
      await client.query(
        "ROLLBACK"
      );
    } catch (
      rollbackError
    ) {
      console.error(
        "Delete slide rollback failed:",
        rollbackError
      );
    }

    next(err);

  } finally {
    client.release();
  }
};



module.exports = { createStory, 
  getStory,
  updateStory,
  getStories, 
  getPublicStory,
  publishStory,
  duplicateSlide,
  deleteSlide,
  duplicateStory,
  deleteStory
 };