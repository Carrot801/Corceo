import {
  useCallback,
  useRef,
} from "react";

import {
  toPng,
} from "html-to-image";

function createSafeFileName(
  value
) {
  const safeName =
    String(
      value ||
        "chart"
    )
      .trim()
      .replace(
        /[<>:"/\\|?*]/g,
        "_"
      )
      .replace(
        /\s+/g,
        " "
      );

  return (
    safeName ||
    "chart"
  );
}

async function waitForExportRender() {
  await document.fonts?.ready;

  await new Promise(
    (resolve) => {
      requestAnimationFrame(
        () => {
          requestAnimationFrame(
            () => {
              setTimeout(
                resolve,
                150
              );
            }
          );
        }
      );
    }
  );
}

function useChartExport({
  chartConfig,
  chartData,
  settings,
}) {
  const exportChartRef =
    useRef(null);

  const createExportImage =
    useCallback(
      async (
        pixelRatio = 2
      ) => {
        const node =
          exportChartRef.current;

        if (!node) {
          throw new Error(
            "The export chart element was not found."
          );
        }

        await waitForExportRender();

        const width = 1400;
        const height = 900;

        return toPng(
          node,
          {
            cacheBust: true,

            pixelRatio,

            backgroundColor:
              "#ffffff",

            width,
            height,

            canvasWidth:
              width *
              pixelRatio,

            canvasHeight:
              height *
              pixelRatio,

            style: {
              width:
                `${width}px`,

              height:
                `${height}px`,

              minWidth:
                `${width}px`,

              minHeight:
                `${height}px`,

              maxWidth:
                "none",

              maxHeight:
                "none",

              overflow:
                "hidden",

              transform:
                "none",

              backgroundColor:
                "#ffffff",
            },

            filter:
              (element) =>
                !element
                  ?.classList
                  ?.contains(
                    "no-export"
                  ),
          }
        );
      },
      []
    );

  const exportPNG =
    useCallback(
      async () => {
        try {
          if (
            !chartConfig.x
          ) {
            throw new Error(
              "Select a field for the X axis before exporting."
            );
          }

          if (
            !Array.isArray(
              chartConfig.y
            ) ||
            chartConfig.y
              .length === 0
          ) {
            throw new Error(
              "Select at least one field for the Y axis before exporting."
            );
          }

          if (
            !Array.isArray(
              chartData
            ) ||
            chartData.length ===
              0
          ) {
            throw new Error(
              "There is no chart data to export."
            );
          }

          const dataUrl =
            await createExportImage(
              2
            );

          const link =
            document.createElement(
              "a"
            );

          link.download =
            `${createSafeFileName(
              settings.title
            )}.png`;

          link.href =
            dataUrl;

          document.body
            .appendChild(
              link
            );

          link.click();
          link.remove();

        } catch (error) {
          console.error(
            "Export failed:",
            error
          );

          alert(
            error.message ||
              "The chart could not be exported."
          );
        }
      },
      [
        chartConfig.x,
        chartConfig.y,
        chartData,
        createExportImage,
        settings.title,
      ]
    );

  return {
    exportChartRef,
    createExportImage,
    exportPNG,
  };
}

export default useChartExport;