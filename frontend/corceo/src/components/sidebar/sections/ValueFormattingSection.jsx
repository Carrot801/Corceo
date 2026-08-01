import { formatValue } from "../../../utils/formatters";

function ValueFormattingSection({
  settings,
  updateSetting,
  openSection,
  toggleSection,
}) {
  return (
    <div className="app-border border-t">
      <button
        type="button"
        onClick={() => toggleSection("valueFormatting")}
        className="app-surface-secondary app-text flex w-full items-center justify-between p-4 text-xs font-bold transition-colors hover:bg-[rgb(var(--color-surface-hover))]"
      >
        Value Formatting

        <span
          className={`transition-transform ${
            openSection === "valueFormatting"
              ? "rotate-180"
              : ""
          }`}
        >
          ^
        </span>
      </button>

      {openSection === "valueFormatting" && (
        <div className="space-y-4 p-4">
          <p className="app-text-muted text-[11px]">
            These settings apply to axis values, labels, and tooltips that use the
            chart format.
          </p>

          {/* Number format */}
          <div>
            <label className="app-text-secondary mb-1 block text-xs font-medium">
              Number Format
            </label>

            <select
              value={settings.numberFormat ?? "default"}
              onChange={(e) =>
                updateSetting("numberFormat", e.target.value)
              }
              className="app-input w-full rounded px-2 py-1.5 text-sm"
            >
              <option value="default">Number</option>
              <option value="currency">Currency</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>

          {/* Currency settings */}
          {settings.numberFormat === "currency" && (
            <div>
              <label className="app-text-secondary mb-1 block text-xs font-medium">
                Currency
              </label>

              <select
                value={settings.currency ?? "USD"}
                onChange={(e) =>
                  updateSetting("currency", e.target.value)
                }
                className="app-input w-full rounded px-2 py-1.5 text-sm"
              >
                <option value="USD">USD — $</option>
                <option value="EUR">EUR — €</option>
                <option value="PLN">PLN — zł</option>
                <option value="GBP">GBP — £</option>
                <option value="UAH">UAH — ₴</option>
              </select>
            </div>
          )}

          {/* Percentage input mode */}
          {settings.numberFormat === "percentage" && (
            <div>
              <label className="app-text-secondary mb-1 block text-xs font-medium">
                Percentage Calculation
              </label>

              <select
      value={
        settings.percentageInputMode ??
        "whole"
      }
      onChange={(e) =>
        updateSetting(
          "percentageInputMode",
          e.target.value
        )
      }
      className="app-input w-full rounded px-2 py-1.5 text-sm"
    >
      <option value="whole">
        Values are percentages — 25 means 25%
      </option>

      <option value="decimal">
        Values are decimals — 0.25 means 25%
      </option>

      <option value="total">
        Percentage of total — 25 of 100 means 25%
      </option>
    </select>

              <p className="app-text-muted mt-1 text-[10px]">
                Choose how percentage values are stored in your dataset.
              </p>
            </div>
          )}

          {/* Decimal places */}
          <div>
            <label className="app-text-secondary mb-1 block text-xs font-medium">
              Decimal Places
            </label>

            <input
              type="number"
              min="0"
              max="6"
              value={settings.decimalPlaces ?? 2}
              onChange={(e) => {
                const value = Number(e.target.value);

                updateSetting(
                  "decimalPlaces",
                  Number.isFinite(value)
                    ? Math.min(6, Math.max(0, value))
                    : 0
                );
              }}
              className="app-input w-full rounded px-2 py-1.5 text-sm"
            />
          </div>

          {/* Thousands separator */}
          <label className="app-text-secondary flex cursor-pointer items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={
                settings.useThousandsSeparator ??
                true
              }
              onChange={(e) =>
                updateSetting(
                  "useThousandsSeparator",
                  e.target.checked
                )
              }
            />

            Use thousands separator
          </label>

          {/* Compact numbers */}
          <label className="app-text-secondary flex cursor-pointer items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={
                settings.compactNumbers ?? false
              }
              onChange={(e) =>
                updateSetting(
                  "compactNumbers",
                  e.target.checked
                )
              }
            />

            Compact large numbers
          </label>

          {settings.compactNumbers && (
            <p className="app-text-muted -mt-2 text-[10px]">
              For example: 1,200 becomes 1.2K and 1,500,000 becomes 1.5M.
            </p>
          )}

          {/* Negative values */}
          <div>
            <label className="app-text-secondary mb-1 block text-xs font-medium">
              Negative Number Style
            </label>

            <select
              value={
                settings.negativeNumberStyle ??
                "minus"
              }
              onChange={(e) =>
                updateSetting(
                  "negativeNumberStyle",
                  e.target.value
                )
              }
              className="app-input w-full rounded px-2 py-1.5 text-sm"
            >
              <option value="minus">
                -1,250
              </option>

              <option value="parentheses">
                (1,250)
              </option>
            </select>
          </div>

          {/* Preview */}
          <div className="app-surface-secondary app-border rounded-lg border p-3">
            <p className="app-text-muted mb-1 text-[10px] font-bold uppercase">
              Preview
            </p>

            <p className="app-text text-sm font-semibold">
              {formatValue(
                1234567.89,
                settings,
                1234567.89
              )}
            </p>
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={() => {
              updateSetting("numberFormat", "default");
              updateSetting("currency", "USD");
              updateSetting("decimalPlaces", 2);
              updateSetting("compactNumbers", false);
              updateSetting("useThousandsSeparator", true);
              updateSetting(
                "percentageInputMode",
                "whole"
              );
              updateSetting(
                "negativeNumberStyle",
                "minus"
              );
            }}
            className="app-surface-secondary app-border app-text-secondary w-full rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-[rgb(var(--color-surface-hover))]"
          >
            Reset Formatting
          </button>
        </div>
      )}
    </div>
  );
}

export default ValueFormattingSection;
