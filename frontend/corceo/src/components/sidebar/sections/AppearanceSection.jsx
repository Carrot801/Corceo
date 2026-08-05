import {
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

import ChartAppearanceSettings from "../ChartAppearanceSettings";

function AppearanceSection({
  chartConfig,
  setChartConfig,
  openSection,
  toggleSection,
}) {
  const isOpen =
    openSection === "appearance";

  return (
    <div className="app-border border-b">
      <button
        type="button"
        onClick={() =>
          toggleSection("appearance")
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
            <SlidersHorizontal
              size={16}
            />
          </div>

          <div className="min-w-0">
            <p className="app-text text-xs font-bold">
              Chart Appearance
            </p>

            <p className="app-text-muted mt-0.5 truncate text-[10px]">
              Axes, shapes, spacing and style
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

      {isOpen && (
        <div
          className="
            app-surface
            border-t
            border-[rgb(var(--color-border))]
            px-4 pb-5 pt-4
          "
        >
          <ChartAppearanceSettings
            chartConfig={
              chartConfig
            }
            setChartConfig={
              setChartConfig
            }
          />
        </div>
      )}
    </div>
  );
}

export default AppearanceSection;