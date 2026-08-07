import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  ChevronDown,
} from "lucide-react";

function HeaderSection({
  settings,
  updateSetting,
  openSection,
  toggleSection,
}) {
const isOpen =
  openSection === "header";
  return (
    <div className="app-border border-b">


    {/* SECTION BUTTON */}
    <button
  type="button"
  onClick={() => toggleSection("header")}
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
  <div className="flex items-center gap-3">
    <div
      className={`
        flex h-8 w-8
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
      <Type size={16} />
    </div>

    <div>
      <p className="app-text text-xs font-bold">
        Header
      </p>

      <p className="app-text-muted mt-0.5 text-[10px]">
        Title, subtitle and description
      </p>
    </div>
  </div>

  <ChevronDown
    size={16}
    className={`
      app-text-muted
      transition-transform
      duration-200
      ${isOpen ? "rotate-180" : ""}
    `}
  />
</button>

    {/* CONTENT */}
    {isOpen && (
    <div
        className="
        app-surface
        border-t
        border-[rgb(var(--color-border))]
        px-4
        pt-4
        pb-5
        space-y-5
        "
    >

            {/* ALIGNMENT */}
            <div>
                <label className="app-text-secondary text-xs font-bold">
                Alignment
                </label>

                <div className="app-surface-secondary app-border mt-2 flex rounded-xl border p-1">

                    <button
                        onClick={() => updateSetting("headerAlign", "left")}
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
                        onClick={() => updateSetting("headerAlign", "center")}
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
                        onClick={() => updateSetting("headerAlign", "right")}
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

            {/* TITLE */}
            <div>
                <label className="app-text-secondary text-xs font-bold">
                Title
                </label>

                <input
                value={settings.title}
                onChange={(e) =>
                    updateSetting("title", e.target.value)
                }
                className="app-input mt-2 w-full rounded-lg px-3 py-2 text-sm"
                />
            </div>

            {/* SUBTITLE */}
            <div>
                <label className="app-text-secondary text-xs font-bold">
                Subtitle
                </label>

                <input
                value={settings.subtitle}
                onChange={(e) =>
                    updateSetting("subtitle", e.target.value)
                }
                className="app-input mt-2 w-full rounded-lg px-3 py-2 text-sm"
                />
            </div>

            {/* DESCRIPTION */}
            <div>
                <label className="app-text-secondary text-xs font-bold">
                Description
                </label>

                <textarea
                value={settings.description}
                onChange={(e) =>
                    updateSetting("description", e.target.value)
                }
                className="app-input w-full mt-1 p-2 text-sm min-h-[90px] rounded-md"
                />
            </div>

        </div>
    )}
    </div>
  );
}

export default HeaderSection;
