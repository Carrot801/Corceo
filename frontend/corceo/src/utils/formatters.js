export const formatValue = (
  value,
  settings = {},
  total = null
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const val = Number(value);

  if (!Number.isFinite(val)) {
    return String(value);
  }

  const decimals = Math.min(
    6,
    Math.max(
      0,
      Number(settings.decimalPlaces ?? 2)
    )
  );

  const locale =
    settings.locale || "en-US";

  const numberFormat =
    settings.numberFormat || "default";

  const formatOptions = {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping:
      settings.useThousandsSeparator ?? true,
  };

  /*
   * Compact notation is useful for numbers and currency,
   * but not percentages.
   */
  if (
    settings.compactNumbers &&
    numberFormat !== "percentage"
  ) {
    formatOptions.notation = "compact";
    formatOptions.compactDisplay = "short";
  }

  let valueToFormat = val;

  if (numberFormat === "percentage") {
    const percentageMode =
      settings.percentageInputMode || "whole";

    if (percentageMode === "decimal") {
      /*
       * 0.25 -> 25%
       */
      valueToFormat = val;
    } else if (percentageMode === "total") {
      /*
       * 25 out of 100 -> 25%
       */
      const numericTotal = Number(total);

      if (
        !Number.isFinite(numericTotal) ||
        numericTotal === 0
      ) {
        return "0%";
      }

      valueToFormat = val / numericTotal;
    } else {
      /*
       * whole mode:
       * 25 -> 25%
       */
      valueToFormat = val / 100;
    }

    return new Intl.NumberFormat(locale, {
      ...formatOptions,
      style: "percent",
    }).format(valueToFormat);
  }

  if (numberFormat === "currency") {
    formatOptions.style = "currency";
    formatOptions.currency =
      settings.currency || "USD";
    formatOptions.currencyDisplay =
      settings.currencyDisplay || "symbol";
  } else {
    formatOptions.style = "decimal";
  }

  let formatted = new Intl.NumberFormat(
    locale,
    formatOptions
  ).format(valueToFormat);

  if (
    val < 0 &&
    settings.negativeNumberStyle ===
      "parentheses"
  ) {
    formatted = formatted.replace(
      /^-/,
      ""
    );

    formatted = `(${formatted})`;
  }

  return formatted;
};