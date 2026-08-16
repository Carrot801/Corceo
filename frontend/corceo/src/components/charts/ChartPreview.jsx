import React from "react";

import BarChartView from "./BarChartView";
import LineChartView from "./LineChartView";
import PieChartView from "./PieChartView";
import WaterfallChartView from "./WaterfallChartView";
import DonutChartView from "./DonutChartView";
import ScatterChartView from "./ScatterChartView";
import HeatmapChartView from "./HeatmapChartView";
import RadarChartView from "./RadarChartView";
import FunnelChartView from "./FunnelChartView";
import ComposedChartView from "./ComposedChartView";
import TreemapChartView from "./TreemapChartView";
import AreaChartView from "./AreaChartView";

import Legend from "../../custom/Legend";


function ChartPreview({
  chartData = [],
  chartConfig = {},
  rawData = [],
  visibleYKeys,
  generatedColors = [],
  settings = {},
  onChartItemClick,
  selectedChartValues = [],
  storyMode = false,
}) {
  // =========================
  // CHART COMPONENTS
  // =========================

  const chartViews = {
    bar: BarChartView,
    line: LineChartView,
    pie: PieChartView,
    donut: DonutChartView,
    area: AreaChartView,
    scatter: ScatterChartView,
    radar: RadarChartView,
    composed: ComposedChartView,
    funnel: FunnelChartView,
    heatmap: HeatmapChartView,
    treemap: TreemapChartView,
    waterfall: WaterfallChartView,
  };

  const ActiveChart =
    chartViews[chartConfig.type] ||
    BarChartView;


  // =========================
  // PROCESSED DATA
  // =========================

  const processedData =
    React.useMemo(() => {
      if (!Array.isArray(chartData)) {
        return [];
      }

      return chartData
        .map((item, index) => ({
          ...item,

          x:
            item.x !== null &&
            item.x !== undefined
              ? String(item.x).trim()
              : "",

          color:
            generatedColors[index] ||
            "#3b82f6",
        }))
        .filter(
          (item) =>
            item.x !== ""
        );
    }, [
      chartData,
      generatedColors,
    ]);


  const filteredColors =
    React.useMemo(() => {
      return processedData.map(
        (item) => item.color
      );
    }, [processedData]);


  // =========================
  // LAYOUT FLAGS
  // =========================

  const isSideLegend =
    settings.showLegend &&
    (
      settings.legendPosition ===
        "left" ||
      settings.legendPosition ===
        "right"
    );

  const isTopBottomLegend =
    settings.showLegend &&
    (
      settings.legendPosition ===
        "top" ||
      settings.legendPosition ===
        "bottom"
    );

  const isExport =
    settings.exportMode === true;


  // =========================
  // ROOT OVERFLOW
  // =========================

  /*
   * Normal visualization:
   * keeps the old scrolling behavior.
   *
   * Story:
   * allows tooltip content to extend
   * outside the individual chart.
   *
   * Export:
   * allows everything to be captured.
   */

  const rootOverflowClass =
    isExport
      ? "h-auto overflow-visible"
      : storyMode
        ? "h-full overflow-visible"
        : "h-full overflow-y-auto";


  // =========================
  // MAIN AREA OVERFLOW
  // =========================

  const mainOverflowClass =
    isExport
      ? "h-auto overflow-visible"
      : storyMode
        ? "h-full overflow-visible"
        : isSideLegend
          ? "h-full overflow-hidden"
          : "overflow-visible";


  // =========================
  // CHART VIEWPORT OVERFLOW
  // =========================

  const viewportOverflowClass =
    isExport
      ? "h-auto overflow-visible"
      : storyMode
        ? "min-h-0 overflow-visible"
        : isTopBottomLegend
          ? ""
          : "min-h-0 overflow-hidden";


  return (
    <div
      className={`
        flex
        w-full
        flex-col
        ${rootOverflowClass}
      `}
      style={
        isExport
          ? {
              width: 1400,
              height: "auto",
              minHeight: "900px",
              overflow: "visible",
            }
          : undefined
      }
    >
      {/* =========================
          HEADER
      ========================= */}

      <div
        className={`
          mb-6
          flex
          w-full
          shrink-0
          flex-col

          ${
            settings.headerAlign ===
            "center"
              ? "items-center text-center"
              : settings.headerAlign ===
                  "right"
                ? "items-end text-right"
                : "items-start text-left"
          }
        `}
      >
        {settings.title && (
          <h1 className="text-2xl font-bold text-slate-800">
            {settings.title}
          </h1>
        )}

        {settings.subtitle && (
          <h2 className="mt-1 text-lg text-slate-500">
            {settings.subtitle}
          </h2>
        )}

        {settings.description && (
          <p className="mt-3 max-w-2xl text-sm text-slate-600">
            {settings.description}
          </p>
        )}
      </div>


      {/* =========================
          MAIN CONTAINER
      ========================= */}

      <div
        className={`
          flex
          w-full
          flex-1
          ${mainOverflowClass}

          ${
            isSideLegend
              ? "flex-row"
              : "flex-col"
          }
        `}
      >
        {/* =========================
            TOP LEGEND
        ========================= */}

        {settings.showLegend &&
          settings.legendPosition ===
            "top" && (
            <div className="mb-4 shrink-0">
              <Legend
                chartData={
                  processedData
                }
                rawData={rawData}
                generatedColors={
                  filteredColors
                }
                settings={settings}
                xField={
                  chartConfig.x
                }
              />
            </div>
          )}


        {/* =========================
            LEFT LEGEND
        ========================= */}

        {settings.showLegend &&
          settings.legendPosition ===
            "left" && (
            <div
              className={`
                w-32
                shrink-0
                p-4

                ${
                  isExport ||
                  storyMode
                    ? "h-auto overflow-visible"
                    : "overflow-y-auto"
                }
              `}
            >
              <Legend
                chartData={
                  processedData
                }
                rawData={rawData}
                generatedColors={
                  filteredColors
                }
                xField={
                  chartConfig.x
                }
                settings={settings}
              />
            </div>
          )}


        {/* =========================
            CHART VIEWPORT
        ========================= */}

        <div
          className={`
            relative
            flex-1
            ${viewportOverflowClass}
          `}
        >
          <div
            className={`
              w-full

              ${
                isExport
                  ? "h-[530px]"
                  : "h-full min-h-0 flex flex-col"
              }
            `}
          >
            <ActiveChart
              chartData={
                processedData
              }
              generatedColors={
                filteredColors
              }
              settings={settings}
              chartConfig={
                chartConfig
              }
              visibleYKeys={
                visibleYKeys
              }
              onChartItemClick={
                onChartItemClick
              }
              selectedChartValues={
                selectedChartValues
              }
              storyMode={
                storyMode
              }
            />
          </div>
        </div>


        {/* =========================
            BOTTOM LEGEND
        ========================= */}

        {settings.showLegend &&
          settings.legendPosition ===
            "bottom" && (
            <div className="mt-4 shrink-0">
              <Legend
                chartData={
                  processedData
                }
                rawData={rawData}
                generatedColors={
                  filteredColors
                }
                xField={
                  chartConfig.x
                }
                settings={settings}
              />
            </div>
          )}


        {/* =========================
            RIGHT LEGEND
        ========================= */}

        {settings.showLegend &&
          settings.legendPosition ===
            "right" && (
            <div
              className={`
                w-32
                shrink-0
                p-4

                ${
                  isExport ||
                  storyMode
                    ? "h-auto overflow-visible"
                    : "overflow-y-auto"
                }
              `}
            >
              <Legend
                chartData={
                  processedData
                }
                rawData={rawData}
                generatedColors={
                  filteredColors
                }
                xField={
                  chartConfig.x
                }
                settings={settings}
              />
            </div>
          )}
      </div>
    </div>
  );
}

export default ChartPreview;