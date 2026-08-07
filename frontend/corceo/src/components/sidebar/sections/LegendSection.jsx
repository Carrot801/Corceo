import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  ListTree,
} from "lucide-react";


function LegendSection({
  settings,
  updateSetting,
  openSection,
  toggleSection,
  handleDropLegend,
  removeMainLegendField,
  yKeys,
  legendShapes,
  moveLegendField,
  removeLegendField,
}) {

const isOpen =
  openSection === "legend";
  return (
            <div className="app-border border-b">
           <button
  type="button"
  onClick={() =>
    toggleSection("legend")
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
      <ListTree size={16} />
    </div>

    <div className="min-w-0">
      <p className="app-text text-xs font-bold">
        Legend
      </p>

      <p className="app-text-muted mt-0.5 truncate text-[10px]">
        Position, fields and visual layout
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
<label className="app-surface-secondary app-border app-text-secondary flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-xs font-semibold">
          <input
        type="checkbox"
        className="h-4 w-4 cursor-pointer accent-[rgb(var(--color-primary))]"
        checked={settings.showLegend}
        onChange={(e) =>
          updateSetting("showLegend", e.target.checked)
        }
      />
      Show Legend
    </label>

    {settings.showLegend && (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropLegend}
        className="app-surface-secondary app-border min-h-[60px] border-2 border-dashed rounded-lg p-3"
      >
        {(settings.legendFields || []).length === 0 ? (
          <p className="app-text-muted text-xs">
            Drag fields here for legend
          </p>
        ) : (
          <div className="space-y-2">
            {settings.legendFields.map((field) => (
              <div
                key={field}
                className="app-surface app-border app-text-secondary flex items-center justify-between border rounded px-2 py-1 text-xs"
              >
                <span>{field}</span>

                <button
                  onClick={() => removeMainLegendField(field)}
                  className="text-[rgb(var(--color-danger))] hover:opacity-80"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )}        
                {/* ALIGN */}


                <div className="space-y-1.5">
                    <label className="app-text-secondary text-xs font-bold">
                        Alignment
                        </label>

                        <div className="app-surface-secondary app-border mt-2 flex rounded-xl border p-1">

                            <button
                                onClick={() => updateSetting("legendAlign", "start")}
                                className={`
                                flex-1
                                h-9
                                rounded-lg
                                flex
                                items-center
                                justify-center
                                transition-all
                                ${
                                settings.headerAlign === "left"
                                    ? "app-surface border border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))] shadow-sm"
                                    : "app-text-muted hover:text-[rgb(var(--color-text))]"
                                }
                                `}
                            >
                                <AlignLeft size={16} />
                            </button>

                            <button
                                onClick={() => updateSetting("legendAlign", "center")}
                               className={`
flex-1
h-9
rounded-lg
flex
items-center
justify-center
transition-all
${
  settings.headerAlign === "center"
    ? "app-surface border border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))] shadow-sm"
    : "app-text-muted hover:text-[rgb(var(--color-text))]"
}
`}
                            >
                                <AlignCenter size={16} />
                            </button>

                            <button
                                onClick={() => updateSetting("legendAlign", "end")}
                                className={`
flex-1
h-9
rounded-lg
flex
items-center
justify-center
transition-all
${
  settings.headerAlign === "right"
    ? "app-surface border border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))] shadow-sm"
    : "app-text-muted hover:text-[rgb(var(--color-text))]"
}
`}
                            >
                                <AlignRight size={16} />
                            </button>

                        </div>
                </div>
                <div className="space-y-2">
                <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
                    Legend Fields
                </label>

                {yKeys.length > 1 && (
                <div className="space-y-2">
                    <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
                    Y Axis Legend
                    </label>

                {yKeys.map((field, index) => {
                    const shape = legendShapes[index % legendShapes.length];

                    return (
                    <div
                        key={field}
                        className="app-surface app-border app-text-secondary flex items-center justify-between gap-2 border rounded-md px-2 py-1.5 text-xs"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                        <span className="app-text-muted cursor-grab">☰</span>

                        <span className="w-4 text-center">
                            {shape === "circle" && "●"}
                            {shape === "square" && "■"}
                            {shape === "triangle" && "▲"}
                            {shape === "diamond" && "◆"}
                            {shape === "star" && "★"}
                        </span>

                        <span className="app-text-secondary truncate font-medium">
                            {field}
                        </span>
                        </div>

                        <div className="flex items-center gap-1">
                        <button
                            onClick={() => moveLegendField(index, -1)}
                            className="app-text-muted px-1 hover:text-[rgb(var(--color-text))]"
                        >
                            ↑
                        </button>

                        <button
                            onClick={() => moveLegendField(index, 1)}
                            className="app-text-muted px-1 hover:text-[rgb(var(--color-text))]"
                        >
                            ↓
                        </button>

                        <button
                            onClick={() => removeLegendField(field)}
                            className="px-1 text-[rgb(var(--color-danger))] hover:opacity-80"
                        >
                            ×
                        </button>
                        </div>
                    </div>
                    );  
                })}
                </div>
                )}
                </div>
                {/* LEGEND TITLE */}
                <div>
                    <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
                    Legend Title
                    </label>

                    <input
                    value={settings.legendTitle}
                    onChange={(e) =>
                        updateSetting("legendTitle", e.target.value)
                    }
                    className="app-input w-full mt-1 p-2 text-sm rounded-md"
                    placeholder="Legend"
                    />
                </div>

                {/* POSITION */}
                <div className="space-y-1.5">
                    <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
                    Position
                    </label>

                    <div className="app-surface-secondary app-border grid grid-cols-4 gap-1 p-1 rounded-xl border">
                    {["top", "right", "bottom", "left"].map((val) => (
                        <button
                        key={val}
                        onClick={() =>
                            updateSetting("legendPosition", val)
                        }
                        className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                            settings.legendPosition === val
                            ? "app-surface text-[rgb(var(--color-primary))] shadow-sm border border-[rgb(var(--color-primary))]"
                            : "app-text-muted hover:text-[rgb(var(--color-text))]"
                        }`}
                        >
                        {val}
                        </button>
                    ))}
                    </div>
                </div>

                {/* DIRECTION */}
                <div className="space-y-1.5">
                    <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
                    Direction
                    </label>

                    <div className="app-surface-secondary app-border grid grid-cols-2 gap-1 p-1 rounded-xl border">
                    {["row", "column"].map((val) => (
                        <button
                        key={val}
                        onClick={() =>
                            updateSetting("legendDirection", val)
                        }
                        className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                            settings.legendDirection === val
                            ? "app-surface text-[rgb(var(--color-primary))] shadow-sm border border-[rgb(var(--color-primary))]"
                            : "app-text-muted hover:text-[rgb(var(--color-text))]"
                        }`}
                        >
                        {val}
                        </button>
                    ))}
                    </div>
                </div>



                {/* SIZE */}
                <div className="space-y-1.5">
                    <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
                    Size
                    </label>

                    <div className="app-surface-secondary app-border grid grid-cols-3 gap-1 p-1 rounded-xl border">
                    {["small", "medium", "large"].map((val) => (
                        <button
                        key={val}
                        onClick={() =>
                            updateSetting("legendSize", val)
                        }
                        className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                            settings.legendSize === val
                            ? "app-surface text-[rgb(var(--color-primary))] shadow-sm border border-[rgb(var(--color-primary))]"
                            : "app-text-muted hover:text-[rgb(var(--color-text))]"
                        }`}
                        >
                        {val}
                        </button>
                    ))}
                    </div>
                </div>

                {/* GAP */}
                <div>
                    <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
                    Gap ({settings.legendGap}px)
                    </label>

                    <input
                    type="range"
                    min="0"
                    max="40"
                    value={settings.legendGap}
                    onChange={(e) =>
                        updateSetting("legendGap", Number(e.target.value))
                    }
                    className="w-full mt-2 accent-[rgb(var(--color-primary))]"
                    />
                </div>
                </div>
            )}
            </div>
  );
}

export default LegendSection;
