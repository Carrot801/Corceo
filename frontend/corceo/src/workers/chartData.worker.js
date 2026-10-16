import { processChartData } from "../utils/processChartData";

let dataset = [];

self.onmessage = ({ data: message }) => {
  const { id, replaceData, data, chartConfig, settings } = message;

  try {
    if (replaceData) {
      dataset = data;
    }

    const processed = processChartData(
      dataset,
      chartConfig,
      settings
    );

    self.postMessage({ id, processed });
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error
        ? error.message
        : String(error),
    });
  }
};