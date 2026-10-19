import React from "react";

import BarChartView from "./BarChartView";
import LineChartView from "./LineChartView";
import PieChartView from "./PieChartView";
import WaterfallChartView from "./WaterfallChartView";
import DonutChartView from "./DonutChartView";
import ScatterChartView from "./ScatterChartView";
import HeatmapChartView from "./HeatmapChartView";
import RadarChartView from "./RadarChartView";
import TreemapChartView from "./TreemapChartView";
import AreaChartView from "./AreaChartView";

import Legend from "../../custom/Legend";

function prepareCircularChart(rows, yKey, colors) {
  const result = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const value = Number(row[yKey] ?? 0);

    if (!Number.isFinite(value) || value < 0) {
      return {
        rows: [],
        groupedCount: 0,
        error:
          "Pie and donut charts require finite, non-negative values.",
      };
    }

    result.push({
      ...row,
      [yKey]: value,
      color:
        row.color ||
        colors[index % Math.max(colors.length, 1)] ||
        "#3b82f6",
    });
  }

  return {
    rows: result,
    groupedCount: 0,
    error: null,
  };
}

function ChartPreview({
  chartData = [],
  chartConfig = {},
  rawData = [],
  visibleYKeys,
  generatedColors = [],
  settings = {},
  onChartItemClick,
  selectedChartValues = [],
  storyMode = false
}) {
const CATEGORIES_PER_PAGE = 100;

const [requestedPage, setRequestedPage] = React.useState(0);

const validChartData = React.useMemo(() => {
  if (!Array.isArray(chartData)) return [];

  return chartData.filter(
    (item) => item.x != null && String(item.x).trim() !== ""
  );
}, [chartData]);

const paginated = false;

const pageCount = paginated
  ? Math.max(1, Math.ceil(validChartData.length / CATEGORIES_PER_PAGE))
  : 1;

const currentPage = Math.min(requestedPage, pageCount - 1);

const pageStart = paginated
  ? currentPage * CATEGORIES_PER_PAGE
  : 0;

const pageEnd = paginated
  ? Math.min(pageStart + CATEGORIES_PER_PAGE, validChartData.length)
  : validChartData.length;

const fullChartTotal = React.useMemo(() => {
  const keys =
    visibleYKeys ??
    (Array.isArray(chartConfig.y)
      ? chartConfig.y
      : chartConfig.y
        ? [chartConfig.y]
        : []);

  return validChartData.reduce(
    (sum, row) =>
      sum + keys.reduce(
        (subtotal, key) => subtotal + (Number(row[key]) || 0),
        0
      ),
    0
  );
}, [validChartData, visibleYKeys, chartConfig.y]);

React.useEffect(() => {
  setRequestedPage(0);
}, [chartData, chartConfig.type]);



  const chartViews = {
    bar: BarChartView,
    line: LineChartView,
    pie: PieChartView,
    donut: DonutChartView,
    area: AreaChartView,
    scatter: ScatterChartView,
    radar: RadarChartView,
    heatmap: HeatmapChartView,
    treemap: TreemapChartView,
    waterfall: WaterfallChartView
  };


  const ActiveChart =
  chartViews[chartConfig.type] ||
  BarChartView;





const isCircularChart =
  chartConfig.type === "pie" ||
  chartConfig.type === "donut";

const circularYKey = Array.isArray(chartConfig.y)
  ? chartConfig.y[0]
  : chartConfig.y || "y";

const circularResult = React.useMemo(() => {
  if (!isCircularChart) return null;

  return prepareCircularChart(
  validChartData,
  circularYKey,
  generatedColors
);
}, [
  isCircularChart,
  validChartData,
  circularYKey,
  generatedColors,
]);

const processedData = React.useMemo(() => {
  const rows = isCircularChart
    ? circularResult.rows
    : validChartData.slice(pageStart, pageEnd);

  return rows.map((item, index) => ({
    ...item,
    x: String(item.x).trim(),
    color:
      item.color ||
      generatedColors[pageStart + index] ||
      "#3b82f6",
  }));
}, [
  isCircularChart,
  circularResult,
  validChartData,
  pageStart,
  pageEnd,
  generatedColors,
]);

const legendSettings = React.useMemo(() => {
  if (!circularResult?.groupedCount) return settings;

  return {
    ...settings,
    legendFields: [],
  };
}, [settings, circularResult]);


  const filteredColors =
  React.useMemo(() => {
    return processedData.map(
      (item) => item.color
    );
  }, [processedData]);






  const isSideLegend =
  settings.showLegend && (

  settings.legendPosition ===
  "left" ||
  settings.legendPosition ===
  "right");


  const isTopBottomLegend =
  settings.showLegend && (

  settings.legendPosition ===
  "top" ||
  settings.legendPosition ===
  "bottom");


  const isExport =
  settings.exportMode === true;


















  const rootOverflowClass =
  isExport ?
  "h-auto overflow-visible" :
  storyMode ?
  "h-full overflow-visible" :
  "h-full overflow-y-auto";






  const mainOverflowClass =
  isExport ?
  "h-auto overflow-visible" :
  storyMode ?
  "h-full overflow-visible" :
  isSideLegend ?
  "h-full overflow-hidden" :
  "overflow-visible";






  const viewportOverflowClass =
  isExport ?
  "h-auto overflow-visible" :
  storyMode ?
  "min-h-0 overflow-visible" :
  isTopBottomLegend ?
  "" :
  "min-h-0 overflow-hidden";


  if (circularResult?.error) {
  return (
    <div
      role="alert"
      className="flex h-full items-center justify-center p-4 text-sm text-red-600"
    >
      {circularResult.error}
    </div>
  );
}

  return (
    <div
      className={`
        flex
        w-full
        flex-col
        ${rootOverflowClass}
      `}
      style={
      isExport ?
      {
        width: 1400,
        height: "auto",
        minHeight: "900px",
        overflow: "visible"
      } :
      undefined
      }>
      {circularResult?.groupedCount > 0 && (
        <p className="app-text-muted mb-3 text-sm">
          The largest entries are shown individually.
          Remaining values are included in “Other”.
        </p>
      )}

      {paginated && pageCount > 1 && (
  <div className="mb-3 flex shrink-0 items-center justify-between gap-3 text-sm">
    <span>
      Categories {pageStart + 1}–{pageEnd} of{" "}
      {validChartData.length}
    </span>

    {!isExport && (
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage === 0}
          onClick={() => setRequestedPage(currentPage - 1)}
          className="app-border rounded border px-3 py-1 disabled:opacity-40"
        >
          Previous
        </button>

        <span>
          {currentPage + 1} / {pageCount}
        </span>

        <button
          type="button"
          disabled={currentPage >= pageCount - 1}
          onClick={() => setRequestedPage(currentPage + 1)}
          className="app-border rounded border px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    )}
  </div>
)}

      <div
        className={`
          mb-6
          flex
          w-full
          shrink-0
          flex-col

          ${
        settings.headerAlign ===
        "center" ?
        "items-center text-center" :
        settings.headerAlign ===
        "right" ?
        "items-end text-right" :
        "items-start text-left"}
        `
        }>
        
        {settings.title &&
        <h1 className="text-2xl font-bold text-slate-800">
            {settings.title}
          </h1>
        }

        {settings.subtitle &&
        <h2 className="mt-1 text-lg text-slate-500">
            {settings.subtitle}
          </h2>
        }

        {settings.description &&
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
            {settings.description}
          </p>
        }
      </div>


      {

      }

      <div
        className={`
          flex
          w-full
          flex-1
          ${mainOverflowClass}

          ${
        isSideLegend ?
        "flex-row" :
        "flex-col"}
        `
        }>
        
        {

        }

        {settings.showLegend &&
        settings.legendPosition ===
        "top" &&
        <div className="mb-4 shrink-0">
              <Legend
            chartData={
            processedData
            }
            rawData={rawData}
            generatedColors={
              ["area", "line", "radar"].includes(chartConfig.type)
                ? generatedColors
                : filteredColors
            }
            settings={legendSettings}
            xField={
            chartConfig.x
            } />
          
            </div>
        }


        {

        }

        {settings.showLegend &&
        settings.legendPosition ===
        "left" &&
        <div
          className={`
                w-48
                shrink-0
                p-4

                ${
          isExport ||
          storyMode ?
          "h-auto overflow-visible" :
          "overflow-y-auto"}
              `
          }>
          
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
            settings={legendSettings} />
          
            </div>
        }


        {

        }

        <div
          className={`
            relative
            flex-1
            ${viewportOverflowClass}
          `}>
          
          <div
            className={`
              w-full

              ${
            isExport ?
            "h-[530px]" :
            "h-full min-h-0 flex flex-col"}
            `
            }>
            
            <ActiveChart
              chartData={
              processedData
              }
              fullChartTotal={fullChartTotal}
              exportMode={isExport}
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
                  ? (item) => {
                      if (item?.__corceoOther) return;
                      onChartItemClick(item);
                    }
                  : undefined
              }
              selectedChartValues={
              selectedChartValues
              }
              storyMode={
              storyMode
              } />
            
          </div>
        </div>


        {

        }

        {settings.showLegend &&
        settings.legendPosition ===
        "bottom" &&
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
            settings={legendSettings} />
          
            </div>
        }


        {

        }

        {settings.showLegend &&
        settings.legendPosition ===
        "right" &&
        <div
          className={`
                w-48
                shrink-0
                p-4

                ${
          isExport ||
          storyMode ?
          "h-auto overflow-visible" :
          "overflow-y-auto"}
              `
          }>
          
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
            settings={legendSettings} />
          
            </div>
        }
      </div>
    </div>);

}

export default ChartPreview;