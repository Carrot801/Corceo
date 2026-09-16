import {
  ChevronDown,
  ListFilter,
} from "lucide-react";

function DataSettingsSection({
  chartConfig,
  setChartConfig,
  columns = [],
  types = {},
  openSection,
  toggleSection,
}) {
  const isOpen =
    openSection === "dataSettings";

  // =========================
  // FIELDS
  // =========================

  const numericFields = columns.filter(
    (column) => types[column] === "number"
  );

  const dateFields = columns.filter(
    (column) => types[column] === "date"
  );

  // =========================
  // DATE RANGE
  // =========================

  const updateDateRange = (updates) => {
    setChartConfig((prev) => ({
      ...prev,

      dateRange: {
        ...prev.dateRange,
        ...updates,
      },
    }));
  };

  // =========================
  // GROUPING
  // =========================

  const updateGrouping = (updates) => {
    setChartConfig((prev) => {
      const nextGrouping = {
        ...prev.grouping,
        ...updates,
      };

      return {
        ...prev,

        grouping: nextGrouping,

        // Grouping always uses SUM
        aggregation:
          nextGrouping.enabled &&
          nextGrouping.field
            ? "sum"
            : prev.aggregation,
      };
    });
  };

  // =========================
  // RANKING
  // =========================

  const updateRanking = (updates) => {
    setChartConfig((prev) => ({
      ...prev,

      ranking: {
        ...prev.ranking,
        ...updates,
      },
    }));
  };

  return (
    <div className="app-border border-b">
      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <button
        type="button"
        onClick={() =>
          toggleSection("dataSettings")
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
            <ListFilter size={16} />
          </div>

          <div className="min-w-0">
            <p className="app-text text-xs font-bold">
              Data Settings
            </p>

            <p className="app-text-muted mt-0.5 truncate text-[10px]">
              Range, grouping and ranking
            </p>
          </div>
        </div>

        <ChevronDown
          size={16}
          className={`
            app-text-muted
            shrink-0
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

      {/* ========================= */}
      {/* CONTENT */}
      {/* ========================= */}

      {isOpen && (
        <div
          className="
            app-surface
            space-y-5
            border-t
            border-[rgb(var(--color-border))]
            px-4 pb-5 pt-4
          "
        >
          {/* ========================= */}
          {/* DATE RANGE */}
          {/* ========================= */}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="app-text text-xs font-bold">
                  Date Range
                </p>

                <p className="app-text-muted mt-0.5 text-[10px]">
                  Choose which period is included
                </p>
              </div>

              <input
                type="checkbox"
                checked={
                  chartConfig.dateRange?.enabled ||
                  false
                }
                onChange={(e) =>
                  updateDateRange({
                    enabled: e.target.checked,
                  })
                }
                className="
                  h-4 w-4 cursor-pointer
                  accent-[rgb(var(--color-primary))]
                "
              />
            </div>

            {chartConfig.dateRange?.enabled && (
              <div className="space-y-3">
                {dateFields.length === 0 ? (
                  <div
                    className="
                      app-surface-secondary
                      app-border
                      rounded-lg border
                      px-3 py-2
                    "
                  >
                    <p className="app-text-muted text-[10px]">
                      No date fields available
                    </p>
                  </div>
                ) : (
                  <>
                    {/* DATE RANGE FIELD */}

                    <div className="space-y-1.5">
                      <label
                        htmlFor="date-range-field"
                        className="
                          app-text-muted
                          text-[11px]
                          font-bold uppercase
                          tracking-wider
                        "
                      >
                        Date field
                      </label>

                      <select
                        id="date-range-field"
                        value={
                          chartConfig.dateRange?.field ||
                          ""
                        }
                        onChange={(e) =>
                          updateDateRange({
                            field:
                              e.target.value ||
                              null,
                          })
                        }
                        className="
                          app-input
                          w-full rounded-lg
                          px-3 py-2
                          text-xs
                        "
                      >
                        <option value="">
                          Select date field
                        </option>

                        {dateFields.map(
                          (column) => (
                            <option
                              key={column}
                              value={column}
                            >
                              {column}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* FROM / TO */}

                    {chartConfig.dateRange?.field && (
                      <div className="grid grid-cols-2 gap-2">
                        {/* FROM */}

                        <div className="min-w-0 space-y-1.5">
                          <label
                            htmlFor="date-range-from"
                            className="
                              app-text-muted
                              text-[11px]
                              font-bold uppercase
                              tracking-wider
                            "
                          >
                            From
                          </label>

                          <input
                            id="date-range-from"
                            type="date"
                            value={
                              chartConfig.dateRange?.from ||
                              ""
                            }
                            onChange={(e) =>
                              updateDateRange({
                                from:
                                  e.target.value ||
                                  null,
                              })
                            }
                            className="
                              app-input
                              w-full min-w-0
                              rounded-lg
                              px-2 py-2
                              text-[11px]
                            "
                          />
                        </div>

                        {/* TO */}

                        <div className="min-w-0 space-y-1.5">
                          <label
                            htmlFor="date-range-to"
                            className="
                              app-text-muted
                              text-[11px]
                              font-bold uppercase
                              tracking-wider
                            "
                          >
                            To
                          </label>

                          <input
                            id="date-range-to"
                            type="date"
                            value={
                              chartConfig.dateRange?.to ||
                              ""
                            }
                            onChange={(e) =>
                              updateDateRange({
                                to:
                                  e.target.value ||
                                  null,
                              })
                            }
                            className="
                              app-input
                              w-full min-w-0
                              rounded-lg
                              px-2 py-2
                              text-[11px]
                            "
                          />
                        </div>
                      </div>
                    )}

                    {/* CLEAR RANGE */}

                    {(chartConfig.dateRange?.from ||
                      chartConfig.dateRange?.to) && (
                      <button
                        type="button"
                        onClick={() =>
                          updateDateRange({
                            from: null,
                            to: null,
                          })
                        }
                        className="
                          app-text-muted
                          text-[10px]
                          font-semibold
                          transition-colors
                          hover:text-[rgb(var(--color-danger))]
                        "
                      >
                        Clear range
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ========================= */}
          {/* GROUPING */}
          {/* ========================= */}

          <div
            className="
              space-y-3
              border-t
              border-[rgb(var(--color-border))]
              pt-4
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="app-text text-xs font-bold">
                  Time Grouping
                </p>

                <p className="app-text-muted mt-0.5 text-[10px]">
                  Combine dates and calculate their sum
                </p>
              </div>

              <input
                type="checkbox"
                checked={
                  chartConfig.grouping?.enabled ||
                  false
                }
                onChange={(e) =>
                  updateGrouping({
                    enabled: e.target.checked,
                  })
                }
                className="
                  h-4 w-4 cursor-pointer
                  accent-[rgb(var(--color-primary))]
                "
              />
            </div>

            {chartConfig.grouping?.enabled && (
              <div className="space-y-3">
                {dateFields.length === 0 ? (
                  <div
                    className="
                      app-surface-secondary
                      app-border
                      rounded-lg border
                      px-3 py-2
                    "
                  >
                    <p className="app-text-muted text-[10px]">
                      No date fields available
                    </p>
                  </div>
                ) : (
                  <>
                    {/* GROUPING FIELD */}

                    <div className="space-y-1.5">
                      <label
                        htmlFor="grouping-field"
                        className="
                          app-text-muted
                          text-[11px]
                          font-bold uppercase
                          tracking-wider
                        "
                      >
                        Date field
                      </label>

                      <select
                        id="grouping-field"
                        value={
                          chartConfig.grouping?.field ||
                          ""
                        }
                        onChange={(e) =>
                          updateGrouping({
                            field:
                              e.target.value ||
                              null,
                          })
                        }
                        className="
                          app-input
                          w-full rounded-lg
                          px-3 py-2
                          text-xs
                        "
                      >
                        <option value="">
                          Select date field
                        </option>

                        {dateFields.map(
                          (column) => (
                            <option
                              key={column}
                              value={column}
                            >
                              {column}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* GROUP BY */}

                    {chartConfig.grouping?.field && (
                      <div className="space-y-1.5">
                        <label
                          htmlFor="grouping-unit"
                          className="
                            app-text-muted
                            text-[11px]
                            font-bold uppercase
                            tracking-wider
                          "
                        >
                          Group by
                        </label>

                        <select
                          id="grouping-unit"
                          value={
                            chartConfig.grouping?.unit ||
                            "month"
                          }
                          onChange={(e) =>
                            updateGrouping({
                              unit: e.target.value,
                            })
                          }
                          className="
                            app-input
                            w-full rounded-lg
                            px-3 py-2
                            text-xs
                          "
                        >
                          <option value="day">
                            Day
                          </option>

                          <option value="week">
                            Week
                          </option>

                          <option value="month">
                            Month
                          </option>

                          <option value="quarter">
                            Quarter
                          </option>

                          <option value="year">
                            Year
                          </option>
                        </select>

                        <p className="app-text-muted text-[10px]">
                          Values are summed for each period.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ========================= */}
          {/* RANKING */}
          {/* ========================= */}

          <div
            className="
              space-y-3
              border-t
              border-[rgb(var(--color-border))]
              pt-4
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="app-text text-xs font-bold">
                  Ranking
                </p>

                <p className="app-text-muted mt-0.5 text-[10px]">
                  Show highest or lowest values
                </p>
              </div>

              <input
                type="checkbox"
                checked={
                  chartConfig.ranking?.enabled ||
                  false
                }
                onChange={(e) =>
                  updateRanking({
                    enabled: e.target.checked,
                  })
                }
                className="
                  h-4 w-4 cursor-pointer
                  accent-[rgb(var(--color-primary))]
                "
              />
            </div>

            {chartConfig.ranking?.enabled && (
              <div className="space-y-3">
                {/* DIRECTION */}

                <div className="space-y-1.5">
                  <label
                    className="
                      app-text-muted
                      text-[11px]
                      font-bold uppercase
                      tracking-wider
                    "
                  >
                    Direction
                  </label>

                  <div
                    className="
                      app-surface-secondary
                      app-border
                      grid grid-cols-2
                      gap-1
                      rounded-xl border p-1
                    "
                  >
                    {["top", "bottom"].map(
                      (direction) => (
                        <button
                          key={direction}
                          type="button"
                          onClick={() =>
                            updateRanking({
                              direction,
                            })
                          }
                          className={`
                            rounded-lg
                            py-1.5
                            text-[10px]
                            font-bold uppercase
                            transition-all
                            ${
                              chartConfig.ranking
                                ?.direction ===
                              direction
                                ? "app-surface border border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))] shadow-sm"
                                : "app-text-muted hover:text-[rgb(var(--color-text))]"
                            }
                          `}
                        >
                          {direction}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* NUMBER OF ITEMS */}

                <div className="space-y-1.5">
                  <label
                    htmlFor="ranking-count"
                    className="
                      app-text-muted
                      text-[11px]
                      font-bold uppercase
                      tracking-wider
                    "
                  >
                    Number of items
                  </label>

                  <input
                    id="ranking-count"
                    type="number"
                    min="1"
                    step="1"
                    value={
                      chartConfig.ranking?.count ??
                      10
                    }
                    onChange={(e) => {
                      const value =
                        Number(e.target.value);

                      if (
                        Number.isInteger(value) &&
                        value >= 1
                      ) {
                        updateRanking({
                          count: value,
                        });
                      }
                    }}
                    className="
                      app-input
                      w-full rounded-lg
                      px-3 py-2
                      text-xs
                    "
                  />
                </div>

                {/* RANK BY */}

                <div className="space-y-1.5">
                  <label
                    htmlFor="ranking-field"
                    className="
                      app-text-muted
                      text-[11px]
                      font-bold uppercase
                      tracking-wider
                    "
                  >
                    Rank by
                  </label>

                  <select
                    id="ranking-field"
                    value={
                      chartConfig.ranking?.field ||
                      ""
                    }
                    onChange={(e) =>
                      updateRanking({
                        field:
                          e.target.value ||
                          null,
                      })
                    }
                    className="
                      app-input
                      w-full rounded-lg
                      px-3 py-2
                      text-xs
                    "
                  >
                    <option value="">
                      Select numeric field
                    </option>

                    {numericFields.map(
                      (column) => (
                        <option
                          key={column}
                          value={column}
                        >
                          {column}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DataSettingsSection;