} catch (err) {
  try {
    await client.query(
      "ROLLBACK"
    );
  } catch (
    rollbackError
  ) {
    console.error(
      "Rollback failed:",
      rollbackError
    );
  }

  if (err.code === "23503") {
    return res
      .status(409)
      .json({
        error:
          "The account still owns projects or stories. Configure cascading deletion or delete those records first.",
      });
  }

  next(err);
}