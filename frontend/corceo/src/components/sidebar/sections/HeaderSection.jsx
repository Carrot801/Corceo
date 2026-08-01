import {
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

function HeaderSection({
  settings,
  updateSetting,
  openSection,
  toggleSection,
}) {
  return (
    <div className="app-border border-b">


    {/* SECTION BUTTON */}
    <button
        onClick={() => toggleSection("header")}
        className="app-surface-secondary app-text w-full p-4 flex justify-between items-center text-xs font-bold hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
    >
        Header
        <span
        className={`transition-transform ${
            openSection === "header" ? "rotate-180" : ""
        }`}
        >
        ^
        </span>
    </button>

    {/* CONTENT */}
    {openSection === "header" && (
        <div className="p-4 space-y-4">

            {/* ALIGNMENT */}
            <div>
                <label className="app-text-secondary text-xs font-bold">
                Alignment
                </label>

                <div className="flex gap-1 mt-1">

                    <button
                        onClick={() => updateSetting("headerAlign", "left")}
                        className={`
                        flex w-10 h-9 items-center justify-center
                        border rounded-md p-2 transition 
                        ${
                            settings.headerAlign === "left"
                            ? "bg-[rgb(var(--color-primary-soft))] border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]"
                            : "app-surface app-border app-text-muted hover:text-[rgb(var(--color-text))]"
                        }
                        `}
                    >
                        <AlignLeft size={16} />
                    </button>

                    <button
                        onClick={() => updateSetting("headerAlign", "center")}
                        className={`
                        flex w-10 h-9 items-center justify-center
                        border rounded-md p-2 transition
                        ${
                            settings.headerAlign === "center"
                            ? "bg-[rgb(var(--color-primary-soft))] border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]"
                            : "app-surface app-border app-text-muted hover:text-[rgb(var(--color-text))]"
                        }
                        `}
                    >
                        <AlignCenter size={16} />
                    </button>

                    <button
                        onClick={() => updateSetting("headerAlign", "right")}
                        className={`
                        flex w-10 h-9 items-center justify-center
                        border rounded-md p-2 transition
                        ${
                            settings.headerAlign === "right"
                            ? "bg-[rgb(var(--color-primary-soft))] border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]"
                            : "app-surface app-border app-text-muted hover:text-[rgb(var(--color-text))]"
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
                className="app-input w-full mt-1 p-2 text-sm rounded-md"
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
                className="app-input w-full mt-1 p-2 text-sm rounded-md"
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
