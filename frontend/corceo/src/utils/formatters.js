export const formatValue = (value, settings, total = null) => {
  if (value == null || isNaN(value)) return value;

  const val = Number(value);
  const decimals = settings.decimalPlaces ?? 2;
  
  // 1. Prepare formatting options
  let formatOptions = {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  };

  // 2. Add Notation (Compact) if enabled
  if (settings.compactNumbers) {
    formatOptions.notation = "compact";
  }

  // 3. Handle Styles (Currency, Percent, or Default)
  if (settings.numberFormat === "percentage") {
    if (!total) return "0%";
    return new Intl.NumberFormat("en-US", {
      ...formatOptions,
      style: "percent",
    }).format(val / total);
  }

  if (settings.numberFormat === "currency") {
    return new Intl.NumberFormat("en-US", {
      ...formatOptions,
      style: "currency",
      currency: "USD",
    }).format(val);
  }

  // Default / Number
  return new Intl.NumberFormat("en-US", formatOptions).format(val);
};