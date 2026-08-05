function parseConditionalNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (
    typeof value === "number"
  ) {
    return Number.isFinite(value)
      ? value
      : null;
  }

  const normalized = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/,/g, "")
    .replace(/[$€£]/g, "")
    .replace(/%$/, "");

  const parsed = Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

export function matchesConditionalRule(
  rawValue,
  rule
) {
  if (!rule || rule.enabled === false) {
    return false;
  }

  const value =
    parseConditionalNumber(rawValue);

  const comparisonValue =
    parseConditionalNumber(rule.value);

  if (
    value === null ||
    comparisonValue === null
  ) {
    return false;
  }

  switch (rule.operator) {
    case "greaterThan":
      return value > comparisonValue;

    case "greaterThanOrEqual":
      return value >= comparisonValue;

    case "lessThan":
      return value < comparisonValue;

    case "lessThanOrEqual":
      return value <= comparisonValue;

    case "equals":
      return value === comparisonValue;

    case "notEquals":
      return value !== comparisonValue;

    default:
      return false;
  }
}

export function getConditionalColor({
  entry,
  seriesKey,
  settings,
  fallbackColor,
}) {
  const conditionalFormatting =
    settings?.conditionalFormatting;

  if (
    !conditionalFormatting?.enabled ||
    !Array.isArray(
      conditionalFormatting.rules
    )
  ) {
    return fallbackColor;
  }

  const matchingRule =
    conditionalFormatting.rules.find(
      (rule) => {
        if (!rule?.field) {
          return false;
        }

        /*
         * Normally a Revenue rule should color
         * the Revenue bars, not another series.
         */
        if (
          rule.applyTo === "sameSeries" &&
          rule.field !== seriesKey
        ) {
          return false;
        }

        return matchesConditionalRule(
          entry?.[rule.field],
          rule
        );
      }
    );

  return (
    matchingRule?.color ||
    fallbackColor
  );
}