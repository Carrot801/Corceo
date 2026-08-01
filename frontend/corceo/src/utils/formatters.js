const replaceThousandsSeparatorWithSpace = (
  formatted,
  useThousandsSeparator = true
) => {
  if (!useThousandsSeparator) {
    return formatted;
  }

  return formatted
    .replace(/[\u00A0\u202F]/g, " ")
    .replace(/(?<=\d),(?=\d{3}(?:\D|$))/g, " ");
};

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

  const useThousandsSeparator =
    settings.useThousandsSeparator ?? true;

  const formatOptions = {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: useThousandsSeparator,
  };

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
      valueToFormat = val;
    } else if (percentageMode === "total") {
      const numericTotal = Number(total);

      if (
        !Number.isFinite(numericTotal) ||
        numericTotal === 0
      ) {
        return "0%";
      }

      valueToFormat = val / numericTotal;
    } else {
      valueToFormat = val / 100;
    }

    const formattedPercentage =
      new Intl.NumberFormat(locale, {
        ...formatOptions,
        style: "percent",
      }).format(valueToFormat);

    return replaceThousandsSeparatorWithSpace(
      formattedPercentage,
      useThousandsSeparator
    );
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

  formatted =
    replaceThousandsSeparatorWithSpace(
      formatted,
      useThousandsSeparator
    );

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