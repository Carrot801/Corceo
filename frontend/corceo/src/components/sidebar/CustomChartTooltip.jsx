import { formatValue } from "../../utils/formatters";

function CustomChartTooltip({
  active,
  payload = [],
  label,
  settings = {},
  total = 0,
}) {
  if (
    !active ||
    payload.length === 0 ||
    settings.showTooltip === false
  ) {
    return null;
  }

  const standardFields =
    settings.tooltipFields ?? ["name", "value"];

  const extraFields =
    settings.tooltipExtraFields ?? [];

  const row = payload[0]?.payload ?? {};

  return (
    <div className="min-w-[180px] rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg">
      {standardFields.includes("name") && (
        <div className="mb-2 font-semibold text-slate-800">
          {label ?? row.x}
        </div>
      )}

      {standardFields.includes("value") &&
        payload.map((item) => (
          <div
            key={String(item.dataKey)}
            className="flex items-center justify-between gap-4 py-1"
          >
            <span className="flex items-center gap-2 text-slate-600">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{
                  backgroundColor:
                    item.color || item.fill,
                }}
              />

              {item.name ?? item.dataKey}
            </span>

            <span className="font-semibold text-slate-800">
              {settings.tooltipUseChartFormat === false
                ? String(item.value)
                : formatValue(
                    item.value,
                    settings,
                    total,
                  )}
            </span>
          </div>
        ))}

      {standardFields.includes("percentage") &&
        payload.map((item) => {
          const value = Number(item.value) || 0;

          const percentage =
            total > 0
              ? (value / total) * 100
              : 0;

          return (
            <div
              key={`${item.dataKey}-percentage`}
              className="flex justify-between gap-4 py-1"
            >
              <span className="text-slate-500">
                {item.name ?? item.dataKey} %
              </span>

              <span className="font-medium text-slate-800">
                {percentage.toFixed(
                  settings.decimalPlaces ?? 1,
                )}
                %
              </span>
            </div>
          );
        })}

      {extraFields.length > 0 && (
        <div className="mt-2 border-t border-slate-200 pt-2">
          {extraFields.map((field) => (
            <div
              key={field}
              className="flex justify-between gap-4 py-1"
            >
              <span className="text-slate-500">
                {field}
              </span>

              <span className="max-w-[180px] truncate font-medium text-slate-800">
                {row[field] ?? "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomChartTooltip;