import { useState } from "react";
import { CHART_PALETTES } from "../../custom/colorPallets";

function PalettePicker({
  settings,
  updateSetting,
  palettes = CHART_PALETTES,
}) {
  const [open, setOpen] = useState(false);

  const active = palettes?.[settings.palette] ?? palettes.Standard;

  return (
    <div className="relative">

      {/* SELECTED */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          w-full p-3 rounded-xl border
          flex items-center justify-between
          bg-white hover:shadow-sm transition
        "
      >
        <span className="text-sm font-semibold">
          {settings.palette}
        </span>

        {/* preview strip */}
        <div className="flex h-3 w-24 rounded overflow-hidden">
          {(active?.preview || []).map((c, i) => (
            <div key={i} className="flex-1" style={{ background: c }} />
          ))}
        </div>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="
          absolute z-50 mt-2 w-full
          bg-white border rounded-xl shadow-lg
          p-2 max-h-64 overflow-auto
        ">
          {Object.entries(palettes).map(([name, p]) => {
            const isActive = settings.palette === name;

            return (
              <button
                key={name}
                onClick={() => {
                  updateSetting("palette", name);
                  setOpen(false);
                }}
                className={`
                  w-full p-2 rounded-lg mb-1 border
                  flex flex-col gap-2 text-left
                  transition
                  ${isActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-transparent hover:bg-slate-50"
                  }
                `}
              >
                {/* name */}
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase">
                    {name}
                  </span>

                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>

                {/* preview */}
                <div className="flex h-2 rounded overflow-hidden">
                  {(p?.preview || []).map((c, i) => (
                    <div key={i} className="flex-1" style={{ background: c }} />
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