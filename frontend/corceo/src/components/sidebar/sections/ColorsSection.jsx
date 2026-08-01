import PalettePicker from "../PalettePicker";

function ColorsSection({
  settings,
  updateSetting,
  openSection,
  toggleSection,
}) {
  return (
    <div className="app-border border-b border-t">
      <button
        type="button"
        onClick={() => toggleSection("colors")}
        className="app-surface-secondary app-text flex w-full items-center justify-between p-4 text-xs font-bold transition-colors hover:bg-[rgb(var(--color-surface-hover))]"
      >
        Colors

        <span
          className={`transition-transform ${
            openSection === "colors"
              ? "rotate-180"
              : ""
          }`}
        >
          ^
        </span>
      </button>

      {openSection === "colors" && (
        <div className="space-y-5 px-4 pb-4 pt-3">
          {/* Built-in palette selector */}
          {!settings.useCustomPalette && (
            <PalettePicker
              settings={settings}
              updateSetting={updateSetting}
            />
          )}

          {/* Color source */}
          <div className="space-y-2">
            <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
              Color Source
            </label>

            <div className="app-surface-secondary app-border grid grid-cols-2 gap-1 rounded-xl border p-1">
              <button
                type="button"
                onClick={() =>
                  updateSetting(
                    "useCustomPalette",
                    false
                  )
                }
                className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${
                  !settings.useCustomPalette
                    ? "app-surface border border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))] shadow-sm"
                    : "app-text-muted hover:text-[rgb(var(--color-text))]"
                }`}
              >
                Built-in
              </button>

              <button
                type="button"
                onClick={() =>
                  updateSetting(
                    "useCustomPalette",
                    true
                  )
                }
                className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${
                  settings.useCustomPalette
                    ? "app-surface border border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))] shadow-sm"
                    : "app-text-muted hover:text-[rgb(var(--color-text))]"
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Built-in palette behavior */}
          {!settings.useCustomPalette && (
            <div className="space-y-2">
              <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
                Palette Behavior
              </label>

              <select
                value={
                  settings.paletteMode ??
                  "automatic"
                }
                onChange={(event) =>
                  updateSetting(
                    "paletteMode",
                    event.target.value
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
                Automatic preserves the visual
                style of the selected palette
                while generating additional
                colors.
              </p>
            </div>
          )}

          {/* Custom palette editor */}
          {settings.useCustomPalette && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
                  Custom Colors
                </label>

                <button
                  type="button"
                  onClick={() => {
                    const current =
                      settings.customPalette ??
                      [];

                    updateSetting(
                      "customPalette",
                      [...current, "#6366f1"]
                    );
                  }}
                  className="text-xs font-semibold text-[rgb(var(--color-primary))] hover:opacity-80"
                >
                  + Add color
                </button>
              </div>

              {(settings.customPalette ?? [])
                .length === 0 ? (
                <div className="app-surface-secondary app-border rounded-lg border border-dashed p-3">
                  <p className="app-text-muted text-xs">
                    Add colors to create your
                    own palette.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(
                    settings.customPalette ?? []
                  ).map((color, index) => (
                    <div
                      key={`custom-color-${index}`}
                      className="app-surface app-border flex items-center gap-2 rounded-lg border p-2"
                    >
                      <input
                        type="color"
                        value={
                          /^#[0-9a-fA-F]{6}$/.test(
                            color
                          )
                            ? color
                            : "#6366f1"
                        }
                        onChange={(event) => {
                          const next = [
                            ...(
                              settings.customPalette ??
                              []
                            ),
                          ];

                          next[index] =
                            event.target.value;

                          updateSetting(
                            "customPalette",
                            next
                          );
                        }}
                        className="h-8 w-10 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
                      />

                      <input
                        type="text"
                        value={color}
                        onChange={(event) => {
                          const next = [
                            ...(
                              settings.customPalette ??
                              []
                            ),
                          ];

                          next[index] =
                            event.target.value;

                          updateSetting(
                            "customPalette",
                            next
                          );
                        }}
                        className="app-input min-w-0 flex-1 rounded px-2 py-1 text-xs"
                        placeholder="#6366f1"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const next = (
                            settings.customPalette ??
                            []
                          ).filter(
                            (_, colorIndex) =>
                              colorIndex !== index
                          );

                          updateSetting(
                            "customPalette",
                            next
                          );
                        }}
                        className="px-1 text-[rgb(var(--color-danger))] hover:opacity-80"
                        aria-label={`Remove color ${
                          index + 1
                        }`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="app-text-secondary flex cursor-pointer items-center gap-2 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={
                    settings.extendCustomPalette ??
                    true
                  }
                  onChange={(event) =>
                    updateSetting(
                      "extendCustomPalette",
                      event.target.checked
                    )
                  }
                />

                Generate matching extra colors
              </label>

              {settings.extendCustomPalette && (
                <div className="space-y-2">
                  <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
                    Extension Style
                  </label>

                  <select
                    value={
                      settings.customExtensionMode ??
                      "distinct"
                    }
                    onChange={(event) =>
                      updateSetting(
                        "customExtensionMode",
                        event.target.value
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
