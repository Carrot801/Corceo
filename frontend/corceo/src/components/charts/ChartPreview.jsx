import BarChartView from "./BarChartView";
import LineChartView from "./LineChartView";
import PieChartView from "./PieChartView";
import Legend from "../../custom/Legend";

function ChartPreview({
  chartData,
  chartConfig,
  generatedColors,
  settings,
}) {
  const isSideLegend = settings.showLegend && (settings.legendPosition === 'left' || settings.legendPosition === 'right');

  return (
<div className="flex-1 flex flex-col h-full overflow-y-auto no-scrollbar p-6 pb-28">
    {/* HEADER */}
    <div
      className={`w-full mb-6 flex flex-col
        ${
          settings.headerAlign === "center"
            ? "items-center text-center"
            : settings.headerAlign === "right"
            ? "items-end text-right"
            : "items-start text-left"
        }
      `}
    >

      {/* TITLE */}
      {settings.title && (
        <h1 className="text-2xl font-bold text-slate-800">
          {settings.title}
        </h1>
      )}

      {/* SUBTITLE */}
      {settings.subtitle && (
        <h2 className="text-lg text-slate-500 mt-1">
          {settings.subtitle}
        </h2>
      )}

      {/* DESCRIPTION */}
      {settings.description && (
        <p className="text-sm text-slate-600 mt-3 max-w-2xl">          
          {settings.description}
        </p>
      )}
    </div>
    <div className={`flex flex-grow-0 w-full ${isSideLegend ? 'flex-row' : 'flex-col'}`}>
      {/* TOP LEGEND */}
      {settings.showLegend && settings.legendPosition === 'top' && (
        <Legend 
        chartData={chartData} 
        generatedColors={generatedColors} 
        settings={settings} />
      )}
      {/* LEFT LEGEND */}
      {settings.showLegend && settings.legendPosition === 'left' && (
        <div className="w-64 shrink-0 p-4">
          <Legend 
          chartData={chartData} 
          generatedColors={generatedColors} 
          settings={settings} />
        </div>
        
      )}

        {/* Chart */}
      <div className="flex-1 relative">

        {chartConfig.type === "bar" && (
          <BarChartView
            chartData={chartData}
            generatedColors={generatedColors}
            settings={settings}
            aggregation={chartConfig.aggregation}
            sort={chartConfig.sort}
          />
        )}

        {chartConfig.type === "line" && (
          <LineChartView
            chartData={chartData}
            generatedColors={generatedColors}
            settings={settings}
            aggregation={chartConfig.aggregation}
            sort={chartConfig.sort}
          />
        )}

        {chartConfig.type === "pie" && (
          <PieChartView
            chartData={chartData}
            generatedColors={generatedColors} 
            settings={settings}
            aggregation={chartConfig.aggregation}
            sort={chartConfig.sort}
          />
        )}
      </div>
      {/* BOTTOM LEGEND */}
      {settings.showLegend &&
        settings.legendPosition === "bottom" && (
          <Legend
            chartData={chartData}
            generatedColors={generatedColors}
            settings={settings}
          />
      )}
      {/* RIGHT LEGEND */}
      {settings.showLegend && settings.legendPosition === 'right' && (
        <div className="w-64 shrink-0 p-4">
          <Legend 
          chartData={chartData} 
          generatedColors={generatedColors} 
          settings={settings} />
        </div>
      )}
    </div>
    </div>

      
  );
}

export default ChartPreview;