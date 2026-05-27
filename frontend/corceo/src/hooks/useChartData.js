import { useMemo } from "react";
import { generatePalette } from "../custom/colorPallets";

function useChartData({ data, chartConfig, settings }) {
  
  const processedData = useMemo(() => {
    if (!data || !chartConfig.x || !chartConfig.y) return [];

    let aggregated = aggregateData(
      data,
      chartConfig.x,
      chartConfig.y,
      chartConfig.aggregation
    );

    return sortData(aggregated, chartConfig.sort);
  }, [data, chartConfig.x, chartConfig.y, chartConfig.aggregation, chartConfig.sort]);

  const generatedColors = useMemo(() => {
    return generatePalette(
      settings.palette,
      settings.paletteMode,
      processedData.length
    );
  }, [settings.palette, settings.paletteMode, processedData.length]);

  function aggregateData(rawData, x, y, mode) {
    if (mode === "none") {
      return rawData.map((row) => ({
        x: row[x],
        y: Number(row[y]) || 0,
      }));
    }

    const map = new Map();

    rawData.forEach((row) => {
      const key = row[x];
      const value = Number(row[y]) || 0;

      if (!map.has(key)) map.set(key, []);
      map.get(key).push(value);
    });

    return Array.from(map.entries()).map(([key, values]) => {
      let aggregated = 0;

      switch (mode) {
        case "avg":
          aggregated = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case "min":
          aggregated = Math.min(...values);
          break;
        case "max":
          aggregated = Math.max(...values);
          break;
        case "count":
          aggregated = values.length;
          break;
        case "sum":
        default:
          aggregated = values.reduce((a, b) => a + b, 0);
      }

      return { x: key, y: aggregated };
    });
  }

  function sortData(chartRows, sortMode) {
    if (sortMode === "asc") {
      return [...chartRows].sort((a, b) => a.y - b.y);
    }
    if (sortMode === "desc") {
      return [...chartRows].sort((a, b) => b.y - a.y);
    }
    return chartRows;
  }

  return {
    chartData: processedData, 
    generatedColors,
  };
}

export default useChartData;