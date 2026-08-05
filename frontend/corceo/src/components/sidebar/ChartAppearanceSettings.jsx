import AxisSettings from "./AxisSettings";
import SettingRange from "./SettingRange";
import SettingToggle from "./SettingToggle";
import SettingSelect from "./SettingSelect";
import SettingColor from "../charts/SettingColor";

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
      {type === "bar" && (
        <div className="space-y-4">
          <p className="app-text text-xs font-bold">
            Bars
          </p>
<SettingRange
  label="Bar width"
  min={5}
  max={100}
  value={appearance.barWidthPercent ?? 70}
  unit="%"
  onChange={(value) =>
    updateAppearance("barWidthPercent", value)
  }
/>
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
          <SettingRange
  label="Series gap"
  min={0}
  max={30}
  value={appearance.barGap ?? 4}
  unit="px"
  onChange={(value) =>
    updateAppearance(
      "barGap",
      value,
    )
  }
/>

<SettingRange
  label="Opacity"
  min={0.1}
  max={1}
  step={0.05}
  value={appearance.opacity ?? 1}
  onChange={(value) =>
    updateAppearance(
      "opacity",
      value,
    )
  }
/>

<SettingToggle
  label="Round bottom corners"
  checked={
    appearance.roundBottom ??
    false
  }
  onChange={(value) =>
    updateAppearance(
      "roundBottom",
      value,
    )
  }
/>

</div>
  )}
{type === "waterfall" && (
  <div className="app-border space-y-4 border-t pt-4">
    <p className="app-text text-xs font-bold">
      Waterfall
    </p>

    <SettingToggle
      label="Show connector lines"
      checked={
        appearance.showConnectors ??
        true
      }
      onChange={(value) =>
        updateAppearance(
          "showConnectors",
          value,
        )
      }
    />

    {appearance.showConnectors !==
      false && (
      <>
        <SettingRange
          label="Connector width"
          min={1}
          max={6}
          value={
            appearance.connectorWidth ??
            1
          }
          unit="px"
          onChange={(value) =>
            updateAppearance(
              "connectorWidth",
              value,
            )
          }
        />

        <SettingSelect
          label="Connector style"
          value={
            appearance.connectorStyle ??
            "solid"
          }
          options={[
            {
              value: "solid",
              label: "Solid",
            },
            {
              value: "dashed",
              label: "Dashed",
            },
            {
              value: "dotted",
              label: "Dotted",
            },
          ]}
          onChange={(value) =>
            updateAppearance(
              "connectorStyle",
              value,
            )
          }
        />

        <SettingColor
          label="Connector color"
          value={
            appearance.connectorColor ??
            "#94a3b8"
          }
          fallback="#94a3b8"
          onChange={(value) =>
            updateAppearance(
              "connectorColor",
              value,
            )
          }
        />
      </>
    )}

    <SettingToggle
      label="Show total bar"
      checked={
        appearance.showTotal ??
        true
      }
      onChange={(value) =>
        updateAppearance(
          "showTotal",
          value,
        )
      }
    />

    {appearance.showTotal !==
      false && (
      <div>
        <label className="app-text-muted text-[10px] font-bold uppercase">
          Total label
        </label>

        <input
          type="text"
          value={
            appearance.totalLabel ??
            "Total"
          }
          onChange={(event) =>
            updateAppearance(
              "totalLabel",
              event.target.value,
            )
          }
          className="app-input mt-1 w-full text-sm"
        />
      </div>
    )}

    <SettingColor
      label="Increase color"
      value={
        appearance.increaseColor ??
        "#22c55e"
      }
      fallback="#22c55e"
      onChange={(value) =>
        updateAppearance(
          "increaseColor",
          value,
        )
      }
    />

    <SettingColor
      label="Decrease color"
      value={
        appearance.decreaseColor ??
        "#ef4444"
      }
      fallback="#ef4444"
      onChange={(value) =>
        updateAppearance(
          "decreaseColor",
          value,
        )
      }
    />

    <SettingColor
      label="Total color"
      value={
        appearance.totalColor ??
        "#3b82f6"
      }
      fallback="#3b82f6"
      onChange={(value) =>
        updateAppearance(
          "totalColor",
          value,
        )
      }
    />

    <SettingRange
      label="Grid opacity"
      min={0}
      max={1}
      step={0.05}
      value={
        appearance.gridOpacity ??
        0.35
      }
      onChange={(value) =>
        updateAppearance(
          "gridOpacity",
          value,
        )
      }
    />

    <SettingToggle
      label="Show zero line"
      checked={
        appearance.showZeroLine ??
        true
      }
      onChange={(value) =>
        updateAppearance(
          "showZeroLine",
          value,
        )
      }
    />

    {appearance.showZeroLine !==
      false && (
      <>
        <SettingRange
          label="Zero line width"
          min={1}
          max={6}
          value={
            appearance.zeroLineWidth ??
            1
          }
          unit="px"
          onChange={(value) =>
            updateAppearance(
              "zeroLineWidth",
              value,
            )
          }
        />

        <SettingColor
          label="Zero line color"
          value={
            appearance.zeroLineColor ??
            "#64748b"
          }
          fallback="#64748b"
          onChange={(value) =>
            updateAppearance(
              "zeroLineColor",
              value,
            )
          }
        />
      </>
    )}

    <SettingToggle
      label="Show hover guide"
      checked={
        appearance.showHoverGuide ??
        true
      }
      onChange={(value) =>
        updateAppearance(
          "showHoverGuide",
          value,
        )
      }
    />
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
          <SettingToggle
  label="Show points"
  checked={
    appearance.showPoints ??
    true
  }
  onChange={(value) =>
    updateAppearance(
      "showPoints",
      value,
    )
  }
/>

<SettingToggle
  label="Connect missing values"
  checked={
    appearance.connectNulls ??
    false
  }
  onChange={(value) =>
    updateAppearance(
      "connectNulls",
      value,
    )
  }
/>

<SettingRange
  label="Series opacity"
  min={0.1}
  max={1}
  step={0.05}
  value={
    appearance.opacity ?? 1
  }
  onChange={(value) =>
    updateAppearance(
      "opacity",
      value,
    )
  }
/>

{type === "area" && (
  <div className="space-y-4">
    <SettingRange
      label="Fill opacity"
      min={0}
      max={1}
      step={0.05}
      value={
        appearance.fillOpacity ?? 0.3
      }
      onChange={(value) =>
        updateAppearance(
          "fillOpacity",
          value,
        )
      }
    />

    <SettingSelect
      label="Area mode"
      value={
        appearance.areaMode ?? "normal"
      }
      options={[
        {
          value: "normal",
          label: "Normal",
        },
        {
          value: "stacked",
          label: "Stacked",
        },
        {
          value: "percent",
          label: "100% stacked",
        },
      ]}
      onChange={(value) =>
        updateAppearance(
          "areaMode",
          value,
        )
      }
    />
  </div>
)}
</div>
      )}
      {["pie", "donut"].includes(type) && (
        <div className="space-y-4">
          <p className="app-text text-xs font-bold">
            {type === "donut"
              ? "Donut shape"
              : "Pie shape"}
          </p>

          <SettingRange
            label="Outer radius"
            min={20}
            max={100}
            value={
              appearance.outerRadius ??
              80
            }
            unit="%"
            onChange={(value) =>
              updateAppearance(
                "outerRadius",
                value,
              )
            }
          />

          {type === "donut" && (
            <SettingRange
              label="Inner radius"
              min={0}
              max={90}
              value={
                appearance.innerRadius ??
                55
              }
              unit="%"
              onChange={(value) =>
                updateAppearance(
                  "innerRadius",
                  value,
                )
              }
            />
          )}

          <SettingRange
            label="Slice gap"
            min={0}
            max={12}
            value={
              appearance.paddingAngle ??
              1
            }
            unit="°"
            onChange={(value) =>
              updateAppearance(
                "paddingAngle",
                value,
              )
            }
          />

          <SettingRange
            label="Start angle"
            min={-360}
            max={360}
            value={
              appearance.startAngle ??
              90
            }
            unit="°"
            onChange={(value) =>
              updateAppearance(
                "startAngle",
                value,
              )
            }
          />

          <SettingRange
            label="Slice corner radius"
            min={0}
            max={20}
            value={
              appearance.sliceRadius ??
              0
            }
            unit="px"
            onChange={(value) =>
              updateAppearance(
                "sliceRadius",
                value,
              )
            }
          />

          <SettingRange
            label="Minimum slice angle"
            min={0}
            max={20}
            value={
              appearance.minSliceAngle ??
              0
            }
            unit="°"
            onChange={(value) =>
              updateAppearance(
                "minSliceAngle",
                value,
              )
            }
          />

          <SettingRange
            label="Opacity"
            min={0.1}
            max={1}
            step={0.05}
            value={
              appearance.opacity ?? 1
            }
            onChange={(value) =>
              updateAppearance(
                "opacity",
                value,
              )
            }
          />

          <SettingToggle
            label="Show slice borders"
            checked={
              appearance.showSliceBorder ??
              true
            }
            onChange={(value) =>
              updateAppearance(
                "showSliceBorder",
                value,
              )
            }
          />

          {appearance.showSliceBorder !==
            false && (
            <>
              <SettingRange
                label="Border width"
                min={0}
                max={8}
                value={
                  appearance.sliceBorderWidth ??
                  1
                }
                unit="px"
                onChange={(value) =>
                  updateAppearance(
                    "sliceBorderWidth",
                    value,
                  )
                }
              />

              <div>
                <label className="app-text-muted text-[10px] font-bold uppercase">
                  Border color
                </label>

                <input
                  type="color"
                  value={
                    appearance.sliceBorderColor ||
                    "#ffffff"
                  }
                  onChange={(event) =>
                    updateAppearance(
                      "sliceBorderColor",
                      event.target.value,
                    )
                  }
                  className="mt-1 h-9 w-full cursor-pointer rounded border"
                />
              </div>
            </>
          )}
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
      value={
        appearance.pointSize ?? 8
      }
      unit="px"
      onChange={(value) =>
        updateAppearance(
          "pointSize",
          value,
        )
      }
    />

    <SettingSelect
      label="Point shape"
      value={
        appearance.pointShape ??
        "circle"
      }
      options={[
        {
          value: "circle",
          label: "Circle",
        },
        {
          value: "square",
          label: "Square",
        },
        {
          value: "diamond",
          label: "Diamond",
        },
        {
          value: "triangle",
          label: "Triangle",
        },
        {
          value: "star",
          label: "Star",
        },
        {
          value: "wye",
          label: "Wye",
        },
      ]}
      onChange={(value) =>
        updateAppearance(
          "pointShape",
          value,
        )
      }
    />

    <SettingRange
      label="Point opacity"
      min={0.1}
      max={1}
      step={0.05}
      value={
        appearance.opacity ?? 0.8
      }
      onChange={(value) =>
        updateAppearance(
          "opacity",
          value,
        )
      }
    />

    <SettingToggle
      label="Show point border"
      checked={
        appearance.showPointBorder ??
        false
      }
      onChange={(value) =>
        updateAppearance(
          "showPointBorder",
          value,
        )
      }
    />

    {appearance.showPointBorder && (
      <>
        <SettingRange
          label="Border width"
          min={1}
          max={6}
          value={
            appearance.pointBorderWidth ??
            1
          }
          unit="px"
          onChange={(value) =>
            updateAppearance(
              "pointBorderWidth",
              value,
            )
          }
        />

        <div>
          <label className="app-text-muted text-[10px] font-bold uppercase">
            Border color
          </label>

          <input
            type="color"
            value={
              appearance.pointBorderColor ??
              "#ffffff"
            }
            onChange={(event) =>
              updateAppearance(
                "pointBorderColor",
                event.target.value,
              )
            }
            className="mt-1 h-9 w-full cursor-pointer rounded"
          />
        </div>
      </>
    )}

    <SettingRange
      label="Grid opacity"
      min={0}
      max={1}
      step={0.05}
      value={
        appearance.gridOpacity ??
        0.35
      }
      onChange={(value) =>
        updateAppearance(
          "gridOpacity",
          value,
        )
      }
    />

    <SettingToggle
      label="Show hover cursor"
      checked={
        appearance.showHoverCursor ??
        true
      }
      onChange={(value) =>
        updateAppearance(
          "showHoverCursor",
          value,
        )
      }
    />

    <SettingToggle
      label="Animate points"
      checked={
        appearance.animate ??
        true
      }
      onChange={(value) =>
        updateAppearance(
          "animate",
          value,
        )
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
          <SettingRange
  label="Line width"
  min={1}
  max={8}
  value={
    appearance.lineWidth ?? 2
  }
  unit="px"
  onChange={(value) =>
    updateAppearance(
      "lineWidth",
      value,
    )
  }
/>

<SettingToggle
  label="Show points"
  checked={
    appearance.showPoints ??
    true
  }
  onChange={(value) =>
    updateAppearance(
      "showPoints",
      value,
    )
  }
/>

<SettingSelect
  label="Grid shape"
  value={
    appearance.gridType ??
    "polygon"
  }
  options={[
    {
      value: "polygon",
      label: "Polygon",
    },
    {
      value: "circle",
      label: "Circle",
    },
  ]}
  onChange={(value) =>
    updateAppearance(
      "gridType",
      value,
    )
  }
/>
        </div>
      )}

     {type === "treemap" && (
  <div className="app-border space-y-4 border-t pt-4">
    <p className="app-text text-xs font-bold">
      Treemap layout
    </p>

    <SettingSelect
      label="Layout ratio"
      value={
        appearance.aspectRatio ??
        "golden"
      }
      options={[
        {
          value: "golden",
          label: "Golden ratio",
        },
        {
          value: "square",
          label: "Square",
        },
        {
          value: "wide",
          label: "Wide",
        },
      ]}
      onChange={(value) =>
        updateAppearance(
          "aspectRatio",
          value,
        )
      }
    />

    <SettingToggle
      label="Show parent labels"
      checked={
        appearance.showParentLabels ??
        true
      }
      onChange={(value) =>
        updateAppearance(
          "showParentLabels",
          value,
        )
      }
    />
  </div>
)}
{type === "heatmap" && (
  <div className="app-border space-y-4 border-t pt-4">
    <p className="app-text text-xs font-bold">
      Heatmap scale
    </p>

    <SettingSelect
      label="Color scale"
      value={
        appearance.colorScale ??
        "sequential"
      }
      options={[
        {
          value: "sequential",
          label: "Sequential",
        },
        {
          value: "diverging",
          label: "Diverging",
        },
      ]}
      onChange={(value) =>
        updateAppearance(
          "colorScale",
          value,
        )
      }
    />

    <SettingToggle
      label="Show color legend"
      checked={
        appearance.showColorLegend ??
        true
      }
      onChange={(value) =>
        updateAppearance(
          "showColorLegend",
          value,
        )
      }
    />

    <SettingToggle
      label="Show cell borders"
      checked={
        appearance.showCellBorders ??
        true
      }
      onChange={(value) =>
        updateAppearance(
          "showCellBorders",
          value,
        )
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