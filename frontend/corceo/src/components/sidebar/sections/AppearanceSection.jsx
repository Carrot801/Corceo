import ChartAppearanceSettings from "../ChartAppearanceSettings";

function AppearanceSection({
  chartConfig,
  setChartConfig,
  openSection,
  toggleSection,
}) {
  return (
    <div className="app-border border-b">
      <button
        type="button"
        onClick={() => toggleSection("appearance")}
        className="app-surface-secondary app-text w-full p-4 flex justify-between items-center text-xs font-bold hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
      >
        Chart Appearance

        <span
          className={`transition-transform ${
            openSection === "appearance" ? "rotate-180" : ""
          }`}
        >
          ^
        </span>
      </button>

      {openSection === "appearance" && (
        <div className="px-4 pb-4 pt-3">
          <ChartAppearanceSettings
            chartConfig={chartConfig}
            setChartConfig={setChartConfig}
          />
        </div>
      )}
    </div>
  );
}

export default AppearanceSection;
