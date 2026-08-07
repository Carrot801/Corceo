import {
  BarChart3,
  ChevronDown,
} from "lucide-react";

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
    const isOpen =
  openSection === "chart";
  return (
    <div className="app-border border-b">
        <button
        type="button"
        onClick={() =>
            toggleSection("chart")
        }
        aria-expanded={isOpen}
        className={`
            app-surface-secondary
            flex w-full items-center
            justify-between gap-3
            px-4 py-3
            text-left
            transition-colors
            hover:bg-[rgb(var(--color-surface-hover))]
            ${
            isOpen
                ? "bg-[rgb(var(--color-surface-hover))]"
                : ""
            }
        `}
        >
        <div className="flex min-w-0 items-center gap-3">
            <div
            className={`
                flex h-8 w-8 shrink-0
                items-center justify-center
                rounded-lg
                transition-colors
                ${
                isOpen
                    ? "bg-[rgb(var(--color-primary)/0.14)] text-[rgb(var(--color-primary))]"
                    : "app-surface app-text-muted"
                }
            `}
            >
            <BarChart3 size={16} />
            </div>

            <div className="min-w-0">
            <p className="app-text text-xs font-bold">
                Chart Type
            </p>

            <p className="app-text-muted mt-0.5 truncate text-[10px]">
                Visualization, aggregation and sorting
            </p>
            </div>
        </div>

        <ChevronDown
            size={16}
            className={`
            app-text-muted shrink-0
            transition-transform
            duration-200
            ${
                isOpen
                ? "rotate-180"
                : ""
            }
            `}
        />
        </button>

        {/* CHART TYPE SECTION */}
        {isOpen && (
        <div
            className="
            app-surface
            space-y-4
            border-t
            border-[rgb(var(--color-border))]
            px-4 pb-5 pt-4
            "
        >
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
