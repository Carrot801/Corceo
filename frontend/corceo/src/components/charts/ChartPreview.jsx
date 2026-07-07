import BarChartView from "./BarChartView";
import LineChartView from "./LineChartView";
import PieChartView from "./PieChartView";
import WaterfallChartView from "./WaterfallChartView";
import DonutChartView from "./DonutChartView"; 
import ScatterChartView from "./ScatterChartView";
import HeatmapChartView from "./HeatmapChartView";
import RadarChartView from "./RadarChartView";
import FunnelChartView from "./FunnelChartView"
import ComposedChartView from "./ComposedChartView";
import TreemapChartView from "./TreemapChartView"

import AreaChartView from "./AreaChartView";   
import Legend from "../../custom/Legend";
import React from "react";

function ChartPreview({
  chartData = [],
  chartConfig,
  rawData = [],
  generatedColors = [],
  settings,
}) {
  
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
  const ActiveChart = chartViews[chartConfig.type] || BarChartView;

  // Clean empty labels and apply conditional zero value dropping
  const processedData = React.useMemo(() => {
    if (!chartData) return [];

    let cleaned = chartData.map((item, idx) => ({
      ...item,
      x: item.x !== null && item.x !== undefined ? String(item.x).trim() : "",
      y: Number(item.y) || 0,
      color: generatedColors[idx] || "#3b82f6"
    }));

    cleaned = cleaned.filter(item => item.x !== "");

    if (settings.hideZeros) {
      cleaned = cleaned.filter(item => item.y !== 0);
    }

    const total = cleaned.reduce((acc, item) => acc + item.y, 0);
    return cleaned.map(item => ({
      ...item,
      percentage: total !== 0 ? (item.y / total) * 100 : 0
    }));
  }, [chartData, generatedColors, settings.hideZeros]);

  const filteredColors = React.useMemo(() => {
    return processedData.map(item => item.color);
  }, [processedData]);

  const isSideLegend = settings.showLegend && (settings.legendPosition === 'left' || settings.legendPosition === 'right');
  const isTB = settings.showLegend && (settings.legendPosition === 'top' || settings.legendPosition === 'bottom');
  const isExport = settings.exportMode;

  return (
    <div
      className={`flex flex-col w-full ${isExport ? "h-auto overflow-visible" : "h-full overflow-y-auto"}`}
      style={isExport ? { width: 1400, height: "auto", minHeight: "900px", overflow: "visible" } : {}}
    >
      {/* HEADER */}
      <div
        className={`w-full mb-6 flex flex-col shrink-0
          ${
            settings.headerAlign === "center"
              ? "items-center text-center"
              : settings.headerAlign === "right"
              ? "items-end text-right"
              : "items-start text-left"
          }
        `}
      >
        {settings.title && <h1 className="text-2xl font-bold text-slate-800">{settings.title}</h1>}
        {settings.subtitle && <h2 className="text-lg text-slate-500 mt-1">{settings.subtitle}</h2>}
        {settings.description && <p className="text-sm text-slate-600 mt-3 max-w-2xl">{settings.description}</p>}
      </div>

      {/* MAIN CONTAINER: Switch overflow-hidden to overflow-visible for exports */}
      <div 
        className={`flex flex-1 w-full ${
          isExport 
            ? "h-auto overflow-visible" 
            : isSideLegend 
              ? "h-full overflow-hidden" 
              : "overflow-visible"
        } ${isSideLegend ? 'flex-row' : 'flex-col'}`}
      >    
        {/* TOP LEGEND */}
        {settings.showLegend && settings.legendPosition === 'top' && (
          <div className="shrink-0 mb-4">
            <Legend 
            chartData={processedData}
            rawData={rawData} 
            generatedColors={filteredColors} 
            settings={settings}
            xField={chartConfig.x}
             />
          </div>
        )}

        {/* LEFT LEGEND */}
        {settings.showLegend && settings.legendPosition === 'left' && (
          <div className={`w-64 shrink-0 p-4 ${isExport ? "h-auto overflow-visible" : "overflow-y-auto"}`}>
            <Legend 
            chartData={processedData} 
            rawData={rawData} 
            generatedColors={filteredColors}
            xField={chartConfig.x} 
            settings={settings} />
          </div>
        )}

        {/* Chart Viewport Wrapper */}
        <div className={`flex-1 relative ${isExport ? 'h-auto overflow-visible' : (isTB ? '' : 'min-h-0 overflow-hidden')}`}>
          {/* CRITICAL FIX: We assign a hardcoded height during export mode so Recharts' 
            ResponsiveContainer doesn't collapse to 0px height inside an auto-growing layout.
          */}
          <div className={`w-full ${isExport ? 'h-[530px]' : 'h-full flex flex-col min-h-0'}`}>

           <ActiveChart
            chartData={processedData}
            generatedColors={filteredColors}
            settings={settings}
            chartConfig={chartConfig}
          />
          </div>
        </div>

        {/* BOTTOM LEGEND */}
        {settings.showLegend && settings.legendPosition === 'bottom' && (
          <div className="shrink-0 mt-4">
            <Legend 
            chartData={processedData} 
            rawData={rawData} 
            generatedColors={filteredColors}
            xField={chartConfig.x} 
            settings={settings} />
          </div>
        )}

        {/* RIGHT LEGEND */}
        {settings.showLegend && settings.legendPosition === 'right' && (
          <div className={`w-64 shrink-0 p-4 ${isExport ? "h-auto overflow-visible" : "overflow-y-auto"}`}>
            <Legend 
            chartData={processedData} 
            rawData={rawData} 
            generatedColors={filteredColors}
            xField={chartConfig.x} 
            settings={settings} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ChartPreview;