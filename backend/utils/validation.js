function parsePositiveInt(
  value,
  fieldName = "id",
) {
  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    const error = new Error(
      `${fieldName} must be a positive integer.`,
    );

    error.status = 400;

    throw error;
  }

  return parsed;
}

function requireString(
  value,
  fieldName,
  {
    min = 1,
    max = 255,
  } = {},
) {
  if (
    typeof value !== "string"
  ) {
    const error = new Error(
      `${fieldName} must be a string.`,
    );

    error.status = 400;

    throw error;
  }

  const trimmed =
    value.trim();

  if (
    trimmed.length < min ||
    trimmed.length > max
  ) {
    const error = new Error(
      `${fieldName} must be between ${min} and ${max} characters.`,
    );

    error.status = 400;

    throw error;
  }

  return trimmed;
}

function requireArray(
  value,
  fieldName,
) {
  if (!Array.isArray(value)) {
    const error = new Error(
      `${fieldName} must be an array.`,
    );

    error.status = 400;

    throw error;
  }

  return value;
}

module.exports = {
  parsePositiveInt,
  requireString,
  requireArray,
};