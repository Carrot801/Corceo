import {
  ChevronDown,
  Palette,
  Plus,
  Trash2,
} from "lucide-react";

import PalettePicker from "../PalettePicker";

function ColorsSection({
  settings,
  updateSetting,
  openSection,
  toggleSection,
}) {
  const isOpen =
    openSection === "colors";

  const customPalette =
    settings.customPalette ?? [];

  const updateCustomColor = (
    index,
    value,
  ) => {
    const next = [
      ...customPalette,
    ];

    next[index] = value;

    updateSetting(
      "customPalette",
      next,
    );
  };

  const removeCustomColor = (
    indexToRemove,
  ) => {
    updateSetting(
      "customPalette",
      customPalette.filter(
        (_, index) =>
          index !== indexToRemove,
      ),
    );
  };

  const addCustomColor = () => {
    updateSetting(
      "customPalette",
      [
        ...customPalette,
        "#6366f1",
      ],
    );
  };

  return (
    <div className="app-border border-b">
      <button
        type="button"
        onClick={() =>
          toggleSection("colors")
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
            <Palette size={16} />
          </div>

          <div className="min-w-0">
            <p className="app-text text-xs font-bold">
              Colors
            </p>

            <p className="app-text-muted mt-0.5 truncate text-[10px]">
              Palettes, gradients and custom colors
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
            space-y-5
            border-t
            border-[rgb(var(--color-border))]
            px-4 pb-5 pt-4
          "
        >
          <div className="space-y-2">
            <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
              Color source
            </label>

            <div className="app-surface-secondary app-border grid grid-cols-2 gap-1 rounded-xl border p-1">
              <button
                type="button"
                onClick={() =>
                  updateSetting(
                    "useCustomPalette",
                    false,
                  )
                }
                className={`
                  rounded-lg px-2 py-1.5
                  text-xs font-semibold
                  transition-all
                  ${
                    !settings.useCustomPalette
                      ? "app-surface border border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))] shadow-sm"
                      : "app-text-muted hover:text-[rgb(var(--color-text))]"
                  }
                `}
              >
                Built-in
              </button>

              <button
                type="button"
                onClick={() =>
                  updateSetting(
                    "useCustomPalette",
                    true,
                  )
                }
                className={`
                  rounded-lg px-2 py-1.5
                  text-xs font-semibold
                  transition-all
                  ${
                    settings.useCustomPalette
                      ? "app-surface border border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))] shadow-sm"
                      : "app-text-muted hover:text-[rgb(var(--color-text))]"
                  }
                `}
              >
                Custom
              </button>
            </div>
          </div>

          {!settings.useCustomPalette && (
            <>
              <div className="app-surface-secondary app-border rounded-xl border p-3">
                <PalettePicker
                  settings={settings}
                  updateSetting={updateSetting}
                />
              </div>

              <div className="space-y-2">
                <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
                  Palette behavior
                </label>

                <select
                  value={
                    settings.paletteMode ??
                    "automatic"
                  }
                  onChange={(event) =>
                    updateSetting(
                      "paletteMode",
                      event.target.value,
                    )
                  }
                  className="app-input w-full rounded-lg px-2 py-2 text-sm"
                >
                  <option value="automatic">
                    Automatic — recommended
                  </option>

                  <option value="distinct">
                    Distinct categories
                  </option>

                  <option value="gradient">
                    Smooth gradient
                  </option>

                  <option value="analogous">
                    Related colors
                  </option>

                  <option value="shuffle">
                    Spread color order
                  </option>

                  <option value="repeat">
                    Repeat original colors
                  </option>
                </select>

                <p className="app-text-muted text-[10px] leading-4">
                  Automatic keeps the selected palette style and generates extra matching colors when needed.
                </p>
              </div>
            </>
          )}

          {settings.useCustomPalette && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="app-text text-xs font-bold">
                    Custom palette
                  </p>

                  <p className="app-text-muted mt-0.5 text-[10px]">
                    Create and manage your own color sequence
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addCustomColor}
                  className="
                    btn-secondary
                    flex shrink-0 items-center
                    gap-1.5 rounded-lg
                    px-2.5 py-1.5
                    text-[11px] font-semibold
                  "
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>

              {customPalette.length ===
              0 ? (
                <div className="app-surface-secondary app-border rounded-xl border-2 border-dashed p-4 text-center">
                  <Palette
                    size={20}
                    className="app-text-muted mx-auto mb-2"
                  />

                  <p className="app-text-muted text-xs">
                    Add colors to create your own palette.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {customPalette.map(
                    (
                      color,
                      index,
                    ) => {
                      const validColor =
                        /^#[0-9a-fA-F]{6}$/.test(
                          color,
                        )
                          ? color
                          : "#6366f1";

                      return (
                        <div
                          key={`custom-color-${index}`}
                          className="
                            app-surface-secondary
                            app-border
                            flex items-center gap-2
                            rounded-xl border
                            p-2
                          "
                        >
                          <input
                            type="color"
                            value={validColor}
                            onChange={(
                              event,
                            ) =>
                              updateCustomColor(
                                index,
                                event.target
                                  .value,
                              )
                            }
                            className="
                              h-8 w-10 shrink-0
                              cursor-pointer
                              rounded-md border-0
                              bg-transparent p-0
                            "
                          />

                          <span
                            className="
                              h-6 w-6 shrink-0
                              rounded-md border
                              border-[rgb(var(--color-border))]
                            "
                            style={{
                              backgroundColor:
                                validColor,
                            }}
                          />

                          <input
                            type="text"
                            value={color}
                            onChange={(
                              event,
                            ) =>
                              updateCustomColor(
                                index,
                                event.target
                                  .value,
                              )
                            }
                            className="
                              app-input
                              min-w-0 flex-1
                              rounded-lg
                              px-2 py-1.5
                              font-mono text-xs
                              uppercase
                            "
                            placeholder="#6366F1"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeCustomColor(
                                index,
                              )
                            }
                            className="
                              app-text-muted
                              rounded-lg p-1.5
                              transition-colors
                              hover:bg-[rgb(var(--color-danger)/0.12)]
                              hover:text-[rgb(var(--color-danger))]
                            "
                            aria-label={`Remove color ${
                              index + 1
                            }`}
                          >
                            <Trash2
                              size={14}
                            />
                          </button>
                        </div>
                      );
                    },
                  )}
                </div>
              )}

              <label className="app-surface-secondary app-border app-text-secondary flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={
                    settings.extendCustomPalette ??
                    true
                  }
                  onChange={(event) =>
                    updateSetting(
                      "extendCustomPalette",
                      event.target.checked,
                    )
                  }
                  className="h-4 w-4 cursor-pointer accent-[rgb(var(--color-primary))]"
                />

                Generate matching extra colors
              </label>

              {settings.extendCustomPalette && (
                <div className="space-y-2">
                  <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
                    Extension style
                  </label>

                  <select
                    value={
                      settings.customExtensionMode ??
                      "distinct"
                    }
                    onChange={(event) =>
                      updateSetting(
                        "customExtensionMode",
                        event.target.value,
                      )
                    }
                    className="app-input w-full rounded-lg px-2 py-2 text-sm"
                  >
                    <option value="distinct">
                      Distinct colors
                    </option>

                    <option value="gradient">
                      Smooth gradient
                    </option>

                    <option value="analogous">
                      Related colors
                    </option>

                    <option value="pastel">
                      Soft pastel
                    </option>

                    <option value="neon">
                      Bright neon
                    </option>

                    <option value="repeat">
                      Repeat colors
                    </option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ColorsSection;