import {
  useCallback,
} from "react";

import {
  apiRequest,
} from "../../api/client";

function useChartPersistence({
  chartConfig,
  settings,

  saveDataset,
  saveChartToBackend,

  createExportImage,

  navigate,
}) {
  const validateChart =
    useCallback(() => {
      if (!chartConfig.x) {
        throw new Error(
          "Select a field for the X axis."
        );
      }

      if (
        !Array.isArray(
          chartConfig.y
        ) ||
        chartConfig.y.length ===
          0
      ) {
        throw new Error(
          "Select at least one field for the Y axis."
        );
      }
    }, [
      chartConfig.x,
      chartConfig.y,
    ]);

  // =========================
  // SAVE CHART
  // =========================

  const saveChart =
    useCallback(
      async () => {
        validateChart();

        let base64Image =
          null;

        try {
          base64Image =
            await createExportImage(
              1
            );
        } catch (error) {
          console.error(
            "Could not create chart preview:",
            error
          );
        }

        try {
          const savedDataset =
            await saveDataset();

          if (
            !savedDataset
              ?.datasetId
          ) {
            throw new Error(
              "Dataset could not be saved."
            );
          }

          const savedChart =
            await saveChartToBackend(
              {
                dataset_id:
                  savedDataset
                    .datasetId,

                chart_type:
                  chartConfig.type,

                x_axis:
                  chartConfig.x,

                y_axis:
                  JSON.stringify(
                    chartConfig.y
                  ),

                settings,

                chart_config:
                  chartConfig,

                image_data:
                  base64Image,
              }
            );

          return savedChart;

        } catch (error) {
          console.error(
            "Save chart failed:",
            error
          );

          throw error;
        }
      },
      [
        chartConfig,
        createExportImage,
        saveChartToBackend,
        saveDataset,
        settings,
        validateChart,
      ]
    );

  // =========================
  // PUBLISH CHART
  // =========================

  const publishChart =
    useCallback(
      async () => {
        try {
          validateChart();

          // Save the newest dataset first.
          const savedDataset =
            await saveDataset();

          if (
            !savedDataset
              ?.datasetId
          ) {
            throw new Error(
              "Dataset could not be saved before publishing."
            );
          }

          // Save the newest chart configuration.
          const savedChart =
            await saveChartToBackend(
              {
                dataset_id:
                  savedDataset
                    .datasetId,

                chart_type:
                  chartConfig.type,

                x_axis:
                  chartConfig.x,

                y_axis:
                  JSON.stringify(
                    chartConfig.y
                  ),

                settings,

                chart_config:
                  chartConfig,
              }
            );

          if (
            !savedChart?.id
          ) {
            throw new Error(
              "Chart could not be saved before publishing."
            );
          }

          // Mark the chart as public.
          await apiRequest(
            `/charts/${savedChart.id}/publish`,
            {
              method: "PUT",
            }
          );

          navigate(
            `/published/${savedChart.id}`
          );

        } catch (error) {
          console.error(
            "Publish failed:",
            error
          );

          alert(
            error.message ||
              "Chart could not be published."
          );
        }
      },
      [
        chartConfig,
        navigate,
        saveChartToBackend,
        saveDataset,
        settings,
        validateChart,
      ]
    );

  return {
    saveChart,
    publishChart,
  };
}

export default useChartPersistence;