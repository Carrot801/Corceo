import ChartTypeSelector from "../ChartTypeSelector";

function ChartTypeSection({
  settings,
  updateSetting,
  chartConfig,
  setChartConfig,
  chartTypes,
  openSection,
  toggleSection,
}) {
  return (
    <div className="app-border border-b">
        <button
        onClick={() => toggleSection("chart")}
        className="app-surface-secondary app-text w-full p-4 flex justify-between items-center text-xs font-bold hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
        >
        Chart Type
        <span
        className={`transition-transform ${
            openSection === "chart" ? "rotate-180" : ""
        }`}
        >
        ^
        </span>
        </button>

        {/* CHART TYPE SECTION */}
        {openSection === "chart" && (
        <div className="px-4 pb-4 space-y-4 pt-3">
            <ChartTypeSelector
            chartTypes={chartTypes}
            chartConfig={chartConfig}
            setChartConfig={setChartConfig}
            />
            <div className="app-border flex items-center gap-2 py-1 border-b pb-3">
                <input
                    type="checkbox"
                    id="hideZeros"
                    checked={settings.hideZeros || false}
                    onChange={(e) => updateSetting("hideZeros", e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-[rgb(var(--color-primary))]"
                />
                <label htmlFor="hideZeros" className="app-text-secondary text-xs font-bold cursor-pointer select-none">
                    Hide rows with 0 value
                </label>
                </div>

            {/* Aggregation Pills */}
            <div className="space-y-1.5">
            <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
                Aggregation
            </label>
            <div className="app-surface-secondary app-border grid grid-cols-3 gap-1 p-1 rounded-xl border">
                {["none", "sum", "avg", "min", "max", "count"].map((val) => (
                <button
                    key={val}
                    onClick={() => setChartConfig(prev => ({ ...prev, aggregation: val }))}
                    className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                    chartConfig.aggregation === val
                        ? "app-surface text-[rgb(var(--color-primary))] shadow-sm border border-[rgb(var(--color-primary))]"
                        : "app-text-muted hover:text-[rgb(var(--color-text))]"
                    }`}
                >
                    {val}
                </button>
                ))}
            </div>
            </div>


            {/* Sort Pills */}
            <div className="space-y-1.5">
            <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
                Sort
            </label>
            <div className="app-surface-secondary app-border grid grid-cols-3 gap-1 p-1 rounded-xl border">
                {["none", "asc", "desc"].map((val) => (
                <button
                    key={val}
                    onClick={() => setChartConfig(prev => ({ ...prev, sort: val }))}
                    className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                    chartConfig.sort === val
                        ? "app-surface text-[rgb(var(--color-primary))] shadow-sm border border-[rgb(var(--color-primary))]"
                        : "app-text-muted hover:text-[rgb(var(--color-text))]"
                    }`}
                >
                    {val === "none" ? "None" : val === "asc" ? "Asc" : "Desc"}
                </button>
                ))}
            </div>
            </div>
        </div>
        )}
    </div>
  );
}

export default ChartTypeSection;
