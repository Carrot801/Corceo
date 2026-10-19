import { useMemo } from "react";
import { generatePalette } from "../custom/colorPallets";
import { processChartData } from "../utils/processChartData";
import useWorkerChartData from "./useWorkerChartData";

function useChartData({
  data,
  chartConfig,
  settings,
  useWorker = false,
}) {
  const request = useMemo(
    () => ({
      data,
      chartConfig: {
        x: chartConfig.x,
        y: chartConfig.y,
        aggregation: chartConfig.aggregation,
        sorting: chartConfig.sorting,
        ranking: chartConfig.ranking,
        filters: chartConfig.filters,
        grouping: chartConfig.grouping,
        dateRange: chartConfig.dateRange,
      },
      settings: {
        hideZeros: settings.hideZeros,
        tooltipExtraFields: settings.tooltipExtraFields,
      },
    }),
    [
      data,
      chartConfig.x,
      chartConfig.y,
      chartConfig.aggregation,
      chartConfig.sorting,
      chartConfig.ranking,
      chartConfig.filters,
      chartConfig.grouping,
      chartConfig.dateRange,
      settings.hideZeros,
      settings.tooltipExtraFields,
    ]
  );

  const workerResult = useWorkerChartData(request, useWorker);

  const synchronousResult = useMemo(() => {
    if (useWorker) return null;

    return processChartData(
      request.data,
      request.chartConfig,
      request.settings
    );
  }, [request, useWorker]);

  const processed = useWorker
    ? workerResult.processed
    : synchronousResult;

const generatedColors = useMemo(() => {
  const colorCount = Math.max(
    processed.visibleYKeys.length,
    processed.rows.length,
    1
  );

const paletteSize = Math.min(colorCount, 20);

  const baseColors = generatePalette(
    settings.palette ?? "Standard",
    settings.paletteMode ?? "automatic",
    paletteSize,
    {
      useCustomPalette: settings.useCustomPalette ?? false,
      customColors: settings.customPalette ?? [],
      extendCustomPalette: settings.extendCustomPalette ?? true,
      customExtensionMode:
        settings.customExtensionMode ?? "distinct",
      ordered: ["heatmap", "waterfall"].includes(chartConfig.type),
    }
  );

  const safeColors =
    baseColors.length > 0 ? baseColors : ["#3b82f6"];

  return Array.from(
    { length: colorCount },
    (_, index) => safeColors[index % safeColors.length]
  );
}, [
  settings.palette,
  settings.paletteMode,
  settings.useCustomPalette,
  settings.customPalette,
  settings.extendCustomPalette,
  settings.customExtensionMode,
  chartConfig.type,
  processed.visibleYKeys.length,
  processed.rows.length,
]);

  return {
    chartData: processed.rows,
    visibleYKeys: processed.visibleYKeys,
    generatedColors,
    isProcessing: workerResult.isProcessing,
    processingError: workerResult.processingError,
  };
}

export default useChartData;