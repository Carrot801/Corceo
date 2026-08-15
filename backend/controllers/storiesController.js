const pool = require("../db");

// 1. CREATE A NEW STORY WITH ANNOTATIONS


const createStory = async (req, res, next) => {
  const { name, slides,folder_id, image_url } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userId = req.user.userId;
    const storyRes = await client.query(
      "INSERT INTO stories (name, user_id, folder_id, image_url) VALUES ($1, $2, $3, $4) RETURNING id",
      [name, userId, folder_id, image_url]
    );
    const storyId = storyRes.rows[0].id;

    for (let i = 0; i < slides.length; i++) {
      const slideRes = await client.query(
        "INSERT INTO slides (story_id, position, description, user_id) VALUES ($1, $2, $3, $4) RETURNING id",
        [storyId, i, slides[i].description || "",userId]
      );
      const slideId = slideRes.rows[0].id;

      // Save Slide Content (Charts)
      if (slides[i].content && Array.isArray(slides[i].content)) {
        for (let j = 0; j < slides[i].content.length; j++) {
          const item = slides[i].content[j];
          await client.query(
            "INSERT INTO slide_content (slide_id, chart_id, position, layout, user_id) VALUES ($1, $2, $3, $4::jsonb, $5)",
            [
              slideId,
              item.chartId,
              j,
              JSON.stringify({
                x: item.x ?? 0,
                y: item.y ?? 0,
                width: item.width ?? 100,
                height: item.height ?? 100,
                zIndex: item.zIndex ?? j + 1,
              }),
              userId,
            ]
          );
        }
      }

      // Save Slide Annotations (Puncts / Shapes)
      if (slides[i].annotations && Array.isArray(slides[i].annotations)) {
        for (let k = 0; k < slides[i].annotations.length; k++) {
          const anno = slides[i].annotations[k];
          await client.query(
            "INSERT INTO slide_annotations (slide_id, annotation, user_id) VALUES ($1, $2, $3)",
            [slideId, JSON.stringify(anno), userId]
          );
        }
      }
    }

    await client.query("COMMIT");
    res.json({ id: storyId, message: "Story created successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};
const updateStory = async (
  req,
  res,
  next
) => {
  const { storyId } =
    req.params;

  const {
    name,
    slides,
    image_url,
  } = req.body;

  const userId =
    req.user.userId;

  // =========================
  // VALIDATION
  // =========================

  if (
    !storyId ||
    Number.isNaN(
      Number(storyId)
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
    !Array.isArray(slides)
  ) {
    return res
      .status(400)
      .json({
        error:
          "Slides must be an array",
      });
  }

  const client =
    await pool.connect();

  try {
    await client.query(
      "BEGIN"
    );

    // =========================
    // UPDATE STORY
    // + VERIFY OWNERSHIP
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
          image_url ?? null,
        ]
      );

    // Story does not exist
    // OR belongs to another user
    if (
      storyUpdate.rows.length ===
      0
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res
        .status(404)
        .json({
          error:
            "Story not found",
        });
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
    // slide_content cascades
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
      let i = 0;
      i < slides.length;
      i++
    ) {
      const slide =
        slides[i];

      const slideRes =
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
            i,
            slide.description ||
              "",
            userId,
          ]
        );

      const slideId =
        slideRes.rows[0].id;

      // =========================
      // RECREATE CONTENT
      // =========================

      if (
        Array.isArray(
          slide.content
        )
      ) {
        for (
          let j = 0;
          j <
          slide.content.length;
          j++
        ) {
          const item =
            slide.content[j];

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
              j,

              JSON.stringify({
                x: Number(
                  item.x ?? 0
                ),

                y: Number(
                  item.y ?? 0
                ),

                width: Number(
                  item.width ??
                    100
                ),

                height: Number(
                  item.height ??
                    100
                ),

                zIndex: Number(
                  item.zIndex ??
                    j + 1
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
          let k = 0;
          k <
          slide.annotations
            .length;
          k++
        ) {
          const annotation =
            slide.annotations[k];

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

    return res.json({
      message:
        "Story updated successfully",
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
        "Story rollback failed:",
        rollbackError
      );
    }

    next(err);

  } finally {
    client.release();
  }
};
const getStories = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const folder_id = req.query.folder_id || null;

    let result;

    if (folder_id) {
      result = await pool.query(
        `
        SELECT *
        FROM stories
        WHERE user_id = $1
        AND folder_id = $2
        ORDER BY id DESC
        `,
        [userId, folder_id]
      );
    } else {
      result = await pool.query(
        `
        SELECT *
        FROM stories
        WHERE user_id = $1
        AND folder_id IS NULL
        ORDER BY id DESC
        `,
        [userId]
      );
    }

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// 3. FETCH AND ASSEMBLE STORY HIERARCHY
const getStory = async (req, res,next) => {
  try {
    const { id } = req.params;

    const userId = req.user.userId;
    // Fetch the parent story
    const storyResult = await pool.query("SELECT * FROM stories WHERE id = $1 AND user_id = $2", [id, userId]);
    if (storyResult.rows.length === 0) return res.status(404).json({ error: "Story not found" });

    // Fetch slides and charts configuration
    const slidesResult = await pool.query(
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
      ORDER BY s.position, sc.position
      `,
      [id]
    );

    // Fetch all annotations for this story separately to prevent SQL Cartesian duplication side effects
    const annotationsResult = await pool.query(
      `
      SELECT sa.slide_id, sa.annotation 
      FROM slide_annotations sa
      JOIN slides s ON s.id = sa.slide_id
      WHERE s.story_id = $1
      `,
      [id]
    );

    // Map slides and inner charts array properties
    const slidesMap = {};
    slidesResult.rows.forEach(row => {
      if (!slidesMap[row.slide_id]) {
        slidesMap[row.slide_id] = { 
          id: row.slide_id, 
          description: row.description, 
          content: [],
          annotations: [] // Placeholder array ready to receive shapes
        };
      }
        if (row.chart_id) {
          slidesMap[row.slide_id].content.push({
            id:
              row.slide_content_id ??
              `${row.slide_id}-${row.chart_id}`,

            type: "chart",
            chartId: row.chart_id,
            name: row.chart_name || "Chart",

            imageUrl:
              row.chart_image_url || null,

            x: Number(row.layout?.x ?? 0),
            y: Number(row.layout?.y ?? 0),
            width: Number(row.layout?.width ?? 100),
            height: Number(row.layout?.height ?? 100),
            zIndex: Number(
              row.layout?.zIndex ??
              row.content_position + 1,
            ),
          });
        }
    });

    // Merge the isolated annotations directly into their respective parent slides
    annotationsResult.rows.forEach(row => {
      if (slidesMap[row.slide_id]) {
        slidesMap[row.slide_id].annotations.push(row.annotation);
      }
    });

    res.json({
      ...storyResult.rows[0],
      slides: Object.values(slidesMap)
    });

  } catch (err) {
    next(err);
  }
};
const getPublicStory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const storyResult = await pool.query(
      `
      SELECT *
      FROM stories
      WHERE id = $1
      AND is_published = true
      `,
      [id]
    );

    if (storyResult.rows.length === 0) {
      return res.status(404).json({ error: "Story not found" });
    }

    const slidesResult = await pool.query(
      `
      SELECT
        s.id AS slide_id,
        s.position AS slide_position,
        s.description,
        sc.chart_id,
        sc.position AS content_position,
        sc.layout,
        p.name AS chart_name
      FROM slides s
      LEFT JOIN slide_content sc ON sc.slide_id = s.id
      LEFT JOIN charts c ON c.id = sc.chart_id
      LEFT JOIN projects p ON p.id = c.project_id
      WHERE s.story_id = $1
      ORDER BY s.position, sc.position
      `,
      [id]
    );

    const annotationsResult = await pool.query(
      `
      SELECT sa.slide_id, sa.annotation
      FROM slide_annotations sa
      JOIN slides s ON s.id = sa.slide_id
      WHERE s.story_id = $1
      `,
      [id]
    );

    const slidesMap = {};

    slidesResult.rows.forEach((row) => {
      if (!slidesMap[row.slide_id]) {
        slidesMap[row.slide_id] = {
          id: row.slide_id,
          description: row.description,
          content: [],
          annotations: [],
        };
      }

      if (row.chart_id) {
        slidesMap[row.slide_id].content.push({
        id: `${row.slide_id}-${row.chart_id}`,
        type: "chart",
        chartId: row.chart_id,
        name: row.chart_name,
        x: Number(row.layout?.x ?? 0),
        y: Number(row.layout?.y ?? 0),
        width: Number(row.layout?.width ?? 100),
        height: Number(row.layout?.height ?? 100),
        zIndex: Number(row.layout?.zIndex ?? row.content_position + 1),
      });
      }
    });

    annotationsResult.rows.forEach((row) => {
      if (slidesMap[row.slide_id]) {
        slidesMap[row.slide_id].annotations.push(row.annotation);
      }
    });

    res.json({
      ...storyResult.rows[0],
      slides: Object.values(slidesMap),
    });
  } catch (err) {
    next(err);
  }
};
const publishStory = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      `
      UPDATE stories
      SET is_published = true
      WHERE id = $1
      AND user_id = $2
      RETURNING id
      `,
      [storyId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Story not found" });
    }

    res.json({
      message: "Story published",
      url: `/publishedStory/${storyId}`,
    });
  } catch (err) {
    next(err);
  }
};
const duplicateStory = async (req, res, next) => {
  const userId = req.user.userId;
  const storyId = req.params.id;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const storyRes = await client.query(
      `
      INSERT INTO stories (name, folder_id, user_id, image_url)
      SELECT name || ' Copy', folder_id, user_id, image_url
      FROM stories
      WHERE id = $1 AND user_id = $2
      RETURNING *
      `,
      [storyId, userId]
    );

    if (storyRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Story not found" });
    }

    const newStory = storyRes.rows[0];

    const slidesRes = await client.query(
      `
      SELECT *
      FROM slides
      WHERE story_id = $1 AND user_id = $2
      ORDER BY position
      `,
      [storyId, userId]
    );

    for (const slide of slidesRes.rows) {
      const newSlideRes = await client.query(
        `
        INSERT INTO slides (story_id, position, description, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `,
        [newStory.id, slide.position, slide.description, userId]
      );

      const newSlideId = newSlideRes.rows[0].id;

      await client.query(
        `
        INSERT INTO slide_content (slide_id, chart_id, position,layout, user_id)
        SELECT $1, chart_id, position, layout, user_id
        FROM slide_content
        WHERE slide_id = $2 AND user_id = $3
        `,
        [newSlideId, slide.id, userId]
      );

      await client.query(
        `
        INSERT INTO slide_annotations (slide_id, annotation, user_id)
        SELECT $1, annotation, user_id
        FROM slide_annotations
        WHERE slide_id = $2 AND user_id = $3
        `,
        [newSlideId, slide.id, userId]
      );
    }

    await client.query("COMMIT");

    res.json(newStory);
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
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

const deleteSlide = async (req, res, next) => {
  const { storyId, slideId } = req.params;
  const userId = req.user.userId;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const slideCheck = await client.query(
      `
      SELECT id, position
      FROM slides
      WHERE id = $1
      AND story_id = $2
      AND user_id = $3
      `,
      [slideId, storyId, userId]
    );

    if (slideCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Slide not found" });
    }

    await client.query(
      `DELETE FROM slide_annotations WHERE slide_id = $1 AND user_id = $2`,
      [slideId, userId]
    );

    await client.query(
      `DELETE FROM slide_content WHERE slide_id = $1 AND user_id = $2`,
      [slideId, userId]
    );

    await client.query(
      `DELETE FROM slides WHERE id = $1 AND story_id = $2 AND user_id = $3`,
      [slideId, storyId, userId]
    );

    await client.query(
      `
      UPDATE slides
      SET position = ordered.new_position
      FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY position, id) - 1 AS new_position
        FROM slides
        WHERE story_id = $1 AND user_id = $2
      ) ordered
      WHERE slides.id = ordered.id
      `,
      [storyId, userId]
    );

    await client.query("COMMIT");

    res.json({ success: true, deletedSlideId: Number(slideId) });
  } catch (err) {
    await client.query("ROLLBACK");
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