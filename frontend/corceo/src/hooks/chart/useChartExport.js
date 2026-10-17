import {
  useCallback,
  useRef } from
"react";

import {
  toPng } from
"html-to-image";

function createSafeFileName(
value)
{
  const safeName =
  String(
    value ||
    "chart"
  ).
  trim().
  replace(
    /[<>:"/\\|?*]/g,
    "_"
  ).
  replace(
    /\s+/g,
    " "
  );

  return (
    safeName ||
    "chart");

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
  visibleChartRef
}) {
  const exportChartRef =
  useRef(null);

const createExportImage = useCallback(
  async (pixelRatio = 2) => {
    await waitForExportRender();

    const visibleNode = visibleChartRef?.current;

    const hasVisiblePreview =
      visibleNode &&
      visibleNode.clientWidth > 0 &&
      visibleNode.clientHeight > 0;

    const node = hasVisiblePreview
      ? visibleNode
      : exportChartRef.current;

    if (!node) {
      throw new Error(
        "The chart element was not found."
      );
    }

    const width = node.clientWidth;
    const height = node.clientHeight;

    if (width <= 0 || height <= 0) {
      throw new Error(
        "The chart must have a visible width and height."
      );
    }

    return toPng(node, {
      cacheBust: true,
      pixelRatio,
      backgroundColor: "#ffffff",

      width,
      height,

      filter: (element) =>
        !element?.classList?.contains("no-export"),
    });
  },
  [visibleChartRef]
);
  const exportPNG =
  useCallback(
    async () => {
      try {
        if (
        !chartConfig.x)
        {
          throw new Error(
            "Select a field for the X axis before exporting."
          );
        }

        if (
        !Array.isArray(
          chartConfig.y
        ) ||
        chartConfig.y.
        length === 0)
        {
          throw new Error(
            "Select at least one field for the Y axis before exporting."
          );
        }

        if (
        !Array.isArray(
          chartData
        ) ||
        chartData.length ===
        0)
        {
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

        document.body.
        appendChild(
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
    settings.title]

  );

  return {
    exportChartRef,
    createExportImage,
    exportPNG
  };
}

export default useChartExport;