import SettingRange from "./SettingRange";
import SettingToggle from "./SettingToggle";
import SettingSelect from "./SettingSelect";

function AxisSettings({
  title,
  axisKey,
  settings = {},
  updateAxis,
  numeric = false,
}) {
  const isXAxis = axisKey === "xAxis";

  const axisIsVisible = settings.visible ?? true;
  const labelsAreVisible = settings.showLabels ?? true;
  const titleIsVisible = settings.showTitle ?? true;

  return (
    <div className="app-border space-y-4 border-t pt-4">
      <div>
        <p className="app-text text-xs font-bold">
          {title}
        </p>

        <p className="app-text-muted mt-0.5 text-[10px]">
          Configure the axis, labels and title.
        </p>
      </div>

      {/* ENTIRE AXIS */}
      <SettingToggle
        label={`Show ${title.toLowerCase()}`}
        checked={axisIsVisible}
        onChange={(value) =>
          updateAxis(axisKey, "visible", value)
        }
      />

      {axisIsVisible && (
        <>
          {/* TICK LABELS */}
          <div className="app-surface-secondary app-border space-y-4 rounded-lg border p-3">
            <p className="app-text-secondary text-[11px] font-bold uppercase tracking-wide">
              Axis labels
            </p>

            <SettingToggle
              label="Show labels"
              checked={labelsAreVisible}
              onChange={(value) =>
                updateAxis(axisKey, "showLabels", value)
              }
            />

            {labelsAreVisible && (
              <>
                <SettingRange
                  label="Label size"
                  min={8}
                  max={24}
                  value={settings.tickSize ?? 11}
                  unit="px"
                  onChange={(value) =>
                    updateAxis(axisKey, "tickSize", value)
                  }
                />

                <SettingRange
                  label="Label distance"
                  min={0}
                  max={30}
                  value={settings.tickMargin ?? 8}
                  unit="px"
                  onChange={(value) =>
                    updateAxis(axisKey, "tickMargin", value)
                  }
                />

                {isXAxis && (
                  <>
                    <SettingSelect
                      label="Label layout"
                      value={settings.labelLayout ?? "auto"}
                      options={[
                        {
                          value: "auto",
                          label: "Automatic",
                        },
                        {
                          value: "horizontal",
                          label: "Horizontal",
                        },
                        {
                          value: "angled",
                          label: "Angled",
                        },
                        {
                          value: "vertical",
                          label: "Vertical",
                        },
                      ]}
                      onChange={(value) =>
                        updateAxis(
                          axisKey,
                          "labelLayout",
                          value,
                        )
                      }
                    />

                    <SettingRange
                      label="Maximum label length"
                      min={6}
                      max={40}
                      value={
                        settings.maxLabelLength ?? 18
                      }
                      onChange={(value) =>
                        updateAxis(
                          axisKey,
                          "maxLabelLength",
                          value,
                        )
                      }
                    />

                    <SettingRange
                      label="Minimum label gap"
                      min={0}
                      max={50}
                      value={settings.minTickGap ?? 16}
                      unit="px"
                      onChange={(value) =>
                        updateAxis(
                          axisKey,
                          "minTickGap",
                          value,
                        )
                      }
                    />

                    <SettingToggle
                      label="Show every label"
                      checked={
                        settings.showEveryLabel ?? false
                      }
                      onChange={(value) =>
                        updateAxis(
                          axisKey,
                          "showEveryLabel",
                          value,
                        )
                      }
                    />
                  </>
                )}
              </>
            )}
          </div>

          {/* AXIS TITLE */}
          <div className="app-surface-secondary app-border space-y-4 rounded-lg border p-3">
            <p className="app-text-secondary text-[11px] font-bold uppercase tracking-wide">
              Axis title
            </p>

            <SettingToggle
              label="Show title"
              checked={titleIsVisible}
              onChange={(value) =>
                updateAxis(axisKey, "showTitle", value)
              }
            />

            {titleIsVisible && (
              <>
                <div>
                  <label className="app-text-muted text-[10px] font-bold uppercase tracking-wide">
                    Title text
                  </label>

                  <input
                    type="text"
                    value={settings.title ?? ""}
                    placeholder={
                      isXAxis
                        ? "X-axis title"
                        : "Y-axis title"
                    }
                    onChange={(event) =>
                      updateAxis(
                        axisKey,
                        "title",
                        event.target.value,
                      )
                    }
                    className="app-input mt-1 w-full text-sm"
                  />
                </div>

                <SettingRange
                  label="Title size"
                  min={8}
                  max={28}
                  value={settings.titleSize ?? 12}
                  unit="px"
                  onChange={(value) =>
                    updateAxis(
                      axisKey,
                      "titleSize",
                      value,
                    )
                  }
                />

                <SettingRange
                  label="Title distance"
                  min={0}
                  max={60}
                  value={settings.titleOffset ?? 16}
                  unit="px"
                  onChange={(value) =>
                    updateAxis(
                      axisKey,
                      "titleOffset",
                      value,
                    )
                  }
                />

                <SettingSelect
                  label="Title weight"
                  value={settings.titleWeight ?? "600"}
                  options={[
                    {
                      value: "400",
                      label: "Regular",
                    },
                    {
                      value: "500",
                      label: "Medium",
                    },
                    {
                      value: "600",
                      label: "Semibold",
                    },
                    {
                      value: "700",
                      label: "Bold",
                    },
                  ]}
                  onChange={(value) =>
                    updateAxis(
                      axisKey,
                      "titleWeight",
                      value,
                    )
                  }
                />
              </>
            )}
          </div>

          {/* AXIS APPEARANCE */}
          <div className="app-surface-secondary app-border space-y-4 rounded-lg border p-3">
            <p className="app-text-secondary text-[11px] font-bold uppercase tracking-wide">
              Axis appearance
            </p>

            <SettingToggle
              label="Show grid lines"
              checked={
                settings.showGrid ??
                (axisKey === "yAxis")
              }
              onChange={(value) =>
                updateAxis(axisKey, "showGrid", value)
              }
            />

            <SettingToggle
              label="Show axis line"
              checked={
                settings.showLine ??
                (axisKey === "xAxis")
              }
              onChange={(value) =>
                updateAxis(axisKey, "showLine", value)
              }
            />

            <SettingToggle
              label="Show tick marks"
              checked={settings.showTicks ?? false}
              onChange={(value) =>
                updateAxis(axisKey, "showTicks", value)
              }
            />
          </div>

          {/* NUMERIC Y-AXIS DOMAIN */}
          {numeric && (
            <div className="app-surface-secondary app-border space-y-3 rounded-lg border p-3">
              <p className="app-text-secondary text-[11px] font-bold uppercase tracking-wide">
                Value range
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="app-text-muted text-[10px] font-bold uppercase">
                    Minimum
                  </label>

                  <input
                    type="number"
                    value={
                      typeof settings.min === "number"
                        ? settings.min
                        : ""
                    }
                    placeholder="Auto"
                    onChange={(event) =>
                      updateAxis(
                        axisKey,
                        "min",
                        event.target.value === ""
                          ? "auto"
                          : Number(event.target.value),
                      )
                    }
                    className="app-input mt-1 w-full text-xs"
                  />
                </div>

                <div>
                  <label className="app-text-muted text-[10px] font-bold uppercase">
                    Maximum
                  </label>

                  <input
                    type="number"
                    value={
                      typeof settings.max === "number"
                        ? settings.max
                        : ""
                    }
                    placeholder="Auto"
                    onChange={(event) =>
                      updateAxis(
                        axisKey,
                        "max",
                        event.target.value === ""
                          ? "auto"
                          : Number(event.target.value),
                      )
                    }
                    className="app-input mt-1 w-full text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AxisSettings;
