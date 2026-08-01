function TooltipSection({
  settings,
  updateSetting,
  openSection,
  toggleSection,
  handleDropTooltipField,
  removeTooltipField,
}) {
  return (
    <div className="app-border border-t">
      <button
        type="button"
        onClick={() => toggleSection("tooltip")}
        className="app-surface-secondary app-text flex w-full items-center justify-between p-4 text-xs font-bold transition-colors hover:bg-[rgb(var(--color-surface-hover))]"
      >
        Tooltip
        <span
          className={`transition-transform ${
            openSection === "tooltip"
              ? "rotate-180"
              : ""
          }`}
        >
          ^
        </span>
      </button>

      {openSection === "tooltip" && (
        <div className="space-y-4 p-4">
          {/* Enable tooltip */}
          <label className="app-text-secondary flex items-center gap-2 text-xs font-semibold">
            <input
              type="checkbox"
              checked={settings.showTooltip ?? true}
              onChange={(e) =>
                updateSetting(
                  "showTooltip",
                  e.target.checked
                )
              }
            />

            Show Tooltip
          </label>

          {settings.showTooltip !== false && (
            <>
              {/* Standard tooltip content */}
              <div>
                <p className="app-text-muted mb-2 text-[10px] font-bold uppercase">
                  Standard Content
                </p>

                <div className="space-y-2">
                  {[
                    {
                      value: "name",
                      label: "Category name",
                    },
                    {
                      value: "value",
                      label: "Value",
                    },
                    {
                      value: "percentage",
                      label: "Percentage",
                    },
                  ].map(({ value, label }) => {
                    const selectedFields =
                      settings.tooltipFields ??
                      ["name", "value"];

                    return (
                      <label
                        key={value}
                        className="app-text-secondary flex items-center gap-2 text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(
                            value
                          )}
                          onChange={(e) => {
                            const current =
                              settings.tooltipFields ??
                              ["name", "value"];

                            const next =
                              e.target.checked
                                ? [
                                    ...new Set([
                                      ...current,
                                      value,
                                    ]),
                                  ]
                                : current.filter(
                                    (field) =>
                                      field !== value
                                  );

                            updateSetting(
                              "tooltipFields",
                              next
                            );
                          }}
                        />

                        {label}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Extra dataset fields */}
              <div>
                <p className="app-text-muted mb-2 text-[10px] font-bold uppercase">
                  Additional Fields
                </p>

                <div
                  onDragOver={(e) =>
                    e.preventDefault()
                  }
                  onDrop={handleDropTooltipField}
                  className="app-surface-secondary app-border min-h-[64px] rounded-lg border-2 border-dashed p-3"
                >
                  {(settings.tooltipExtraFields || [])
                    .length === 0 ? (
                    <p className="app-text-muted text-xs">
                      Drag fields here to show them
                      in the tooltip
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {settings.tooltipExtraFields.map(
                        (field) => (
                          <div
                            key={field}
                            className="app-surface app-border app-text-secondary flex items-center justify-between rounded border px-2 py-1 text-xs"
                          >
                            <span className="truncate">
                              {field}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                removeTooltipField(
                                  field
                                )
                              }
                              className="text-[rgb(var(--color-danger))] hover:opacity-80"
                            >
                              ×
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default TooltipSection;
