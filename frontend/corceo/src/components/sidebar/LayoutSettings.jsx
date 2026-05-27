import React from "react";

function LayoutSettings({
  settings,
  updateSetting,
}) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm text-slate-600">
          Show Grid
        </label>

        <input
          type="checkbox"
          checked={settings.showGrid}
          onChange={(e) =>
            updateSetting(
              "showGrid",
              e.target.checked
            )
          }
          className="w-4 h-4"
        />
      </div>
    </div>
  );
}

export default LayoutSettings;