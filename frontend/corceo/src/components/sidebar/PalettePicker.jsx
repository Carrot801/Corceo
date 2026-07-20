import { useState } from "react";
import { CHART_PALETTES } from "../../custom/colorPallets";

function PalettePicker({
  settings,
  updateSetting,
  palettes = CHART_PALETTES,
}) {
  const [open, setOpen] = useState(false);

  const fallbackPalette =
    palettes?.Standard ?? Object.values(palettes ?? {})[0];

  const active = palettes?.[settings.palette] ?? fallbackPalette;

  return (
    <div className="relative">
      {/* SELECTED PALETTE */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="
          app-card app-text
          flex w-full items-center justify-between
          rounded-xl p-3
          transition
          hover:bg-[rgb(var(--color-surface-hover))]
          hover:shadow-sm
        "
      >
        <span className="text-sm font-semibold">
          {settings.palette}
        </span>

        <div className="flex h-3 w-24 overflow-hidden rounded">
          {(active?.preview ?? []).map((color, index) => (
            <div
              key={`${color}-${index}`}
              className="flex-1"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          className="
            app-menu
            absolute z-50 mt-2
            max-h-64 w-full overflow-auto
            rounded-xl p-2
          "
        >
          {Object.entries(palettes ?? {}).map(([name, palette]) => {
            const isActive = settings.palette === name;

            return (
              <button
                type="button"
                key={name}
                onClick={() => {
                  updateSetting("palette", name);
                  setOpen(false);
                }}
                className={`
                  mb-1 flex w-full flex-col gap-2
                  rounded-lg border p-2
                  text-left transition-colors
                  ${
                    isActive
                      ? `
                        border-[rgb(var(--color-primary))]
                        bg-[rgb(var(--color-primary-soft))]
                        text-[rgb(var(--color-primary))]
                      `
                      : `
                        border-transparent
                        text-[rgb(var(--color-text-secondary))]
                        hover:bg-[rgb(var(--color-surface-hover))]
                        hover:text-[rgb(var(--color-text))]
                      `
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase">
                    {name}
                  </span>

                  {isActive && (
                    <div
                      className="
                        h-2 w-2 rounded-full
                        bg-[rgb(var(--color-primary))]
                      "
                    />
                  )}
                </div>

                <div className="flex h-2 overflow-hidden rounded">
                  {(palette?.preview ?? []).map((color, index) => (
                    <div
                      key={`${color}-${index}`}
                      className="flex-1"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PalettePicker;