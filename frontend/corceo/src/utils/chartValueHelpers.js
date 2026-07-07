export const getYKey = (chartConfig) => {
  return Array.isArray(chartConfig?.y)
    ? chartConfig.y[0]
    : chartConfig?.y || "y";
};

export const getTotal = (chartData = [], yKey = "y") => {
  return chartData.reduce(
    (sum, item) => sum + (Number(item[yKey]) || 0),
    0
  );
};

export const getPercent = (value, total) => {
  return total ? (Number(value) / total) * 100 : 0;
};