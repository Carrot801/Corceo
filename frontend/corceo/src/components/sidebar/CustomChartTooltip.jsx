import { useContext } from "react";
import { formatValue } from "../../utils/formatters";

import {
  StoryChartScaleContext,} from "../../context/StoryChartScaleContext";

function CustomChartTooltip({
  active,
  payload = [],
  label,
  settings = {},
  total = 0,
}) {
  // Hooks must always run first
  const storyScale =
    useContext(
      StoryChartScaleContext
    );

  const inverseScale =
    storyScale > 0
      ? 1 / storyScale
      : 1;

if (
  !active ||
  !Array.isArray(payload) ||
  payload.length === 0 ||
  settings.showTooltip === false
) {
  return null;
}

const standardFields =
  settings.tooltipFields ?? [
    "name",
    "value",
  ];

const extraFields =
  settings.tooltipExtraFields ?? [];

const row =
  payload[0]?.payload ?? {};
  
const hasName =
  standardFields.includes("name") &&
  (label ?? row.x) !== null &&
  (label ?? row.x) !== undefined &&
  String(label ?? row.x).trim() !== "";

const hasValue =
  standardFields.includes("value") &&
  payload.some(
    (item) =>
      item?.value !== null &&
      item?.value !== undefined &&
      item?.value !== "",
  );

const hasPercentage =
  standardFields.includes(
    "percentage",
  ) &&
  payload.some(
    (item) =>
      item?.value !== null &&
      item?.value !== undefined &&
      item?.value !== "",
  );

const hasExtraField =
  extraFields.some(
    (field) =>
      row?.[field] !== null &&
      row?.[field] !== undefined &&
      String(
        row[field],
      ).trim() !== "",
  );

const hasContent =
  hasName ||
  hasValue ||
  hasPercentage ||
  hasExtraField;

if (!hasContent) {
  return null;
}
  
  return (
    <div
      className="
        min-w-[180px]
        rounded-lg
        border
        border-slate-200
        bg-white
        p-3
        text-xs
        shadow-lg
      "
      style={{
        transform: `scale(${inverseScale})`,
        transformOrigin: "top left",
      }}
    >
      {standardFields.includes(
        "name"
      ) && (
        <div className="mb-2 font-semibold text-slate-800">
          {label ?? row.x}
        </div>
      )}

      {standardFields.includes(
        "value"
      ) &&
        payload.map((item) => (
          <div
            key={String(
              item.dataKey
            )}
            className="flex items-center justify-between gap-4 py-1"
          >
            <span className="flex items-center gap-2 text-slate-600">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{
                  backgroundColor:
                    item.color ||
                    item.fill,
                }}
              />

              {item.name ??
                item.dataKey}
            </span>

            <span className="font-semibold text-slate-800">
              {settings.tooltipUseChartFormat ===
              false
                ? String(
                    item.value
                  )
                : formatValue(
                    item.value,
                    settings,
                    total
                  )}
            </span>
          </div>
        ))}

      {standardFields.includes(
        "percentage"
      ) &&
        payload.map((item) => {
          const value =
            Number(
              item.value
            ) || 0;

          const percentage =
            total > 0
              ? (value /
                  total) *
                100
              : 0;

          return (
            <div
              key={`${item.dataKey}-percentage`}
              className="flex justify-between gap-4 py-1"
            >
              <span className="text-slate-500">
                {item.name ??
                  item.dataKey}{" "}
                %
              </span>

              <span className="font-medium text-slate-800">
                {percentage.toFixed(
                  settings.decimalPlaces ??
                    1
                )}
                %
              </span>
            </div>
          );
        })}

      {extraFields.length >
        0 && (
        <div className="mt-2 border-t border-slate-200 pt-2">
          {extraFields.map(
            (field) => (
              <div
                key={field}
                className="flex justify-between gap-4 py-1"
              >
                <span className="text-slate-500">
                  {field}
                </span>

                <span className="max-w-[180px] truncate font-medium text-slate-800">
                  {row[field] ??
                    "—"}
                </span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default CustomChartTooltip;