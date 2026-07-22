import AxisSettings from "./AxisSettings";
import SettingRange from "./SettingRange";
import SettingToggle from "./SettingToggle";
import SettingSelect from "./SettingSelect";

function ChartAppearanceSettings({
  chartConfig,
  setChartConfig,
}) {
  const type = chartConfig?.type;
  const appearance = chartConfig?.appearance || {};

  const updateAppearance = (key, value) => {
    setChartConfig((previous) => ({
      ...previous,
      appearance: {
        ...(previous.appearance || {}),
        [key]: value,
      },
    }));
  };

  const updateAxis = (axisKey, key, value) => {
    setChartConfig((previous) => ({
      ...previous,
      appearance: {
        ...(previous.appearance || {}),
        [axisKey]: {
          ...(previous.appearance?.[axisKey] || {}),
          [key]: value,
        },
      },
    }));
  };

  const xAxis = appearance.xAxis || {};
  const yAxis = appearance.yAxis || {};

  const hasCartesianAxes = [
    "bar",
    "line",
    "area",
    "scatter",
    "composed",
    "waterfall",
  ].includes(type);

  return (
    <div className="space-y-5">
      {["bar", "waterfall"].includes(type) && (
        <div className="space-y-4">
          <p className="app-text text-xs font-bold">
            Bars
          </p>

          <SettingRange
            label="Bar width"
            min={4}
            max={100}
            value={appearance.barSize ?? 32}
            unit="px"
            onChange={(value) =>
              updateAppearance("barSize", value)
            }
          />

          <SettingRange
            label="Category spacing"
            min={0}
            max={60}
            value={appearance.barCategoryGap ?? 24}
            unit="%"
            onChange={(value) =>
                updateAppearance("barCategoryGap", value)
            }
            />

            {Array.isArray(chartConfig.y) &&
            chartConfig.y.length > 1 && (
                <SettingRange
                label="Series gap"
                min={0}
                max={30}
                value={appearance.barGap ?? 4}
                unit="px"
                onChange={(value) =>
                    updateAppearance("barGap", value)
                }
                />
            )}

          <SettingRange
            label="Corner radius"
            min={0}
            max={24}
            value={appearance.barRadius ?? 6}
            unit="px"
            onChange={(value) =>
              updateAppearance("barRadius", value)
            }
          />

          {type === "waterfall" && (
            <>
              <SettingToggle
                label="Show connector lines"
                checked={appearance.showConnectors ?? true}
                onChange={(value) =>
                  updateAppearance("showConnectors", value)
                }
              />

              <SettingToggle
                label="Show total bar"
                checked={appearance.showTotal ?? true}
                onChange={(value) =>
                  updateAppearance("showTotal", value)
                }
              />
            </>
          )}
        </div>
      )}

      {["line", "area", "composed"].includes(type) && (
        <div className="space-y-4">
          <p className="app-text text-xs font-bold">
            Series
          </p>

          <SettingRange
            label="Line width"
            min={1}
            max={10}
            value={appearance.lineWidth ?? 3}
            unit="px"
            onChange={(value) =>
              updateAppearance("lineWidth", value)
            }
          />

          <SettingRange
            label="Point size"
            min={0}
            max={12}
            value={appearance.pointSize ?? 4}
            unit="px"
            onChange={(value) =>
              updateAppearance("pointSize", value)
            }
          />

          <SettingSelect
            label="Line style"
            value={appearance.lineStyle ?? "smooth"}
            options={[
              { value: "smooth", label: "Smooth" },
              { value: "linear", label: "Linear" },
              { value: "step", label: "Step" },
            ]}
            onChange={(value) =>
              updateAppearance("lineStyle", value)
            }
          />

          {type === "area" && (
            <SettingRange
              label="Fill opacity"
              min={0}
              max={1}
              step={0.05}
              value={appearance.fillOpacity ?? 0.3}
              onChange={(value) =>
                updateAppearance("fillOpacity", value)
              }
            />
          )}
        </div>
      )}

      {["pie", "donut"].includes(type) && (
        <div className="space-y-4">
          <p className="app-text text-xs font-bold">
            Pie shape
          </p>

          <SettingRange
            label="Outer radius"
            min={20}
            max={100}
            value={appearance.outerRadius ?? 80}
            unit="%"
            onChange={(value) =>
              updateAppearance("outerRadius", value)
            }
          />

          <SettingRange
            label="Inner radius"
            min={0}
            max={90}
            value={
              appearance.innerRadius ??
              (type === "donut" ? 55 : 0)
            }
            unit="%"
            onChange={(value) =>
              updateAppearance("innerRadius", value)
            }
          />

          <SettingRange
            label="Slice gap"
            min={0}
            max={12}
            value={appearance.paddingAngle ?? 1}
            unit="°"
            onChange={(value) =>
              updateAppearance("paddingAngle", value)
            }
          />

          <SettingRange
            label="Start angle"
            min={-360}
            max={360}
            value={appearance.startAngle ?? 90}
            unit="°"
            onChange={(value) =>
              updateAppearance("startAngle", value)
            }
          />
        </div>
      )}

      {type === "scatter" && (
        <div className="space-y-4">
          <p className="app-text text-xs font-bold">
            Points
          </p>

          <SettingRange
            label="Point size"
            min={2}
            max={30}
            value={appearance.pointSize ?? 8}
            unit="px"
            onChange={(value) =>
              updateAppearance("pointSize", value)
            }
          />

          <SettingSelect
            label="Point shape"
            value={appearance.pointShape ?? "circle"}
            options={[
              "circle",
              "square",
              "diamond",
              "triangle",
            ]}
            onChange={(value) =>
              updateAppearance("pointShape", value)
            }
          />
        </div>
      )}

      {type === "radar" && (
        <div className="space-y-4">
          <SettingRange
            label="Radius"
            min={20}
            max={100}
            value={appearance.outerRadius ?? 75}
            unit="%"
            onChange={(value) =>
              updateAppearance("outerRadius", value)
            }
          />

          <SettingRange
            label="Fill opacity"
            min={0}
            max={1}
            step={0.05}
            value={appearance.fillOpacity ?? 0.25}
            onChange={(value) =>
              updateAppearance("fillOpacity", value)
            }
          />

          <SettingToggle
            label="Show radar grid"
            checked={appearance.showGrid ?? true}
            onChange={(value) =>
              updateAppearance("showGrid", value)
            }
          />
        </div>
      )}

      {["treemap", "heatmap"].includes(type) && (
        <div className="space-y-4">
          <SettingRange
            label="Cell gap"
            min={0}
            max={12}
            value={appearance.cellGap ?? 2}
            unit="px"
            onChange={(value) =>
              updateAppearance("cellGap", value)
            }
          />

          <SettingRange
            label="Cell radius"
            min={0}
            max={16}
            value={appearance.cellRadius ?? 2}
            unit="px"
            onChange={(value) =>
              updateAppearance("cellRadius", value)
            }
          />

          <SettingToggle
            label="Show values"
            checked={appearance.showValues ?? true}
            onChange={(value) =>
              updateAppearance("showValues", value)
            }
          />
        </div>
      )}

      {hasCartesianAxes && (
        <>
          <AxisSettings
            title="X axis"
            axisKey="xAxis"
            settings={xAxis}
            updateAxis={updateAxis}
            numeric={type === "scatter"}
          />

          <AxisSettings
            title="Y axis"
            axisKey="yAxis"
            settings={yAxis}
            updateAxis={updateAxis}
            numeric
          />
        </>
      )}
    </div>
  );
}

export default ChartAppearanceSettings;