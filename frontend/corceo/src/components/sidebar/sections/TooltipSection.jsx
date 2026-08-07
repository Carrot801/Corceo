import {
  ChevronDown,
  MessageSquareText,
} from "lucide-react";

function TooltipSection({
  settings,
  updateSetting,
  openSection,
  toggleSection,
  handleDropTooltipField,
  removeTooltipField,
}) {
const isOpen =
  openSection === "tooltip";
  return (
    <div className="app-border border-b">
      <button
  type="button"
  onClick={() =>
    toggleSection("tooltip")
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
      <MessageSquareText size={16} />
    </div>

    <div className="min-w-0">
      <p className="app-text text-xs font-bold">
        Tooltip
      </p>

      <p className="app-text-muted mt-0.5 truncate text-[10px]">
        Hover details and additional fields
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
            space-y-4
            border-t
            border-[rgb(var(--color-border))]
            px-4 pb-5 pt-4
          "
        >
          {/* Enable tooltip */}
          <label className="app-surface-secondary app-border app-text-secondary flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-xs font-semibold">
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
