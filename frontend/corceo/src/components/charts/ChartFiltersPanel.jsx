function ChartFiltersPanel({
  chartConfig,
  setChartConfig,
  columns,
  types,
}) {
  const numericFields = columns.filter(
    (column) => types[column] === "number"
  );

  const dateFields = columns.filter(
    (column) => types[column] === "date"
  );

  const updateSorting = (updates) => {
    setChartConfig((prev) => ({
      ...prev,
      sorting: {
        ...prev.sorting,
        ...updates,
      },
    }));
  };

  const updateRanking = (updates) => {
    setChartConfig((prev) => ({
      ...prev,
      ranking: {
        ...prev.ranking,
        ...updates,
      },
    }));
  };

const updateDateGrouping = (updates) => {
  setChartConfig((prev) => {
    const nextDateGrouping = {
      ...prev.dateGrouping,
      ...updates,
    };

    const sourceField = nextDateGrouping.field;
    const interval = nextDateGrouping.interval;

    let nextX = prev.x;

    if (sourceField && interval !== "none") {
      const suffixMap = {
        month: "Month",
        quarter: "Quarter",
        year: "Year",
      };

      const suffix = suffixMap[interval];

      if (suffix) {
        nextX = `${sourceField}_${suffix}`;
      }
    }

    if (sourceField && interval === "none") {
      nextX = sourceField;
    }

    return {
      ...prev,
      x: nextX,
      dateGrouping: nextDateGrouping,
      sorting: {
        ...prev.sorting,
        field: "x",
        direction: "asc",
      },
    };
  });
};
  return (
    <div className="border-t bg-white">
      <div className="p-3 border-b">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Chart settings
        </h3>
      </div>

      <div className="p-3 space-y-5">
        <section>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            Aggregation
          </label>

          <select
            value={chartConfig.aggregation || "none"}
            onChange={(e) =>
              setChartConfig((prev) => ({
                ...prev,
                aggregation: e.target.value,
              }))
            }
            className="w-full border rounded-md px-2 py-2 text-sm"
          >
            <option value="none">No aggregation</option>
            <option value="sum">Sum</option>
            <option value="avg">Average</option>
            <option value="count">Count</option>
            <option value="min">Minimum</option>
            <option value="max">Maximum</option>
          </select>
        </section>

        <section>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            Sort
          </label>

          <select
            value={chartConfig.sorting?.field || ""}
            onChange={(e) =>
              updateSorting({
                field: e.target.value || null,
              })
            }
            className="w-full border rounded-md px-2 py-2 text-sm mb-2"
          >
            <option value="">Select field</option>

            {columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>

          <select
            value={chartConfig.sorting?.direction || "none"}
            onChange={(e) =>
              updateSorting({
                direction: e.target.value,
              })
            }
            className="w-full border rounded-md px-2 py-2 text-sm"
          >
            <option value="none">No sorting</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-500">
              Top / Bottom N
            </label>

            <input
              type="checkbox"
              checked={chartConfig.ranking?.enabled || false}
              onChange={(e) =>
                updateRanking({
                  enabled: e.target.checked,
                })
              }
            />
          </div>

          {chartConfig.ranking?.enabled && (
            <div className="space-y-2">
              <select
                value={chartConfig.ranking?.direction || "top"}
                onChange={(e) =>
                  updateRanking({
                    direction: e.target.value,
                  })
                }
                className="w-full border rounded-md px-2 py-2 text-sm"
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>

              <select
                value={chartConfig.ranking?.count || 10}
                onChange={(e) =>
                  updateRanking({
                    count: Number(e.target.value),
                  })
                }
                className="w-full border rounded-md px-2 py-2 text-sm"
              >
                <option value={5}>5 items</option>
                <option value={10}>10 items</option>
                <option value={20}>20 items</option>
                <option value={50}>50 items</option>
              </select>

              <select
                value={chartConfig.ranking?.field || ""}
                onChange={(e) =>
                  updateRanking({
                    field: e.target.value || null,
                  })
                }
                className="w-full border rounded-md px-2 py-2 text-sm"
              >
                <option value="">Select value field</option>

                {numericFields.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        <section>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            Date grouping
          </label>

          <select
            value={chartConfig.dateGrouping?.field || ""}
            onChange={(e) =>
              updateDateGrouping({
                field: e.target.value || null,
              })
            }
            className="w-full border rounded-md px-2 py-2 text-sm mb-2"
          >
            <option value="">Select date field</option>

            {dateFields.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>

          <select
            value={chartConfig.dateGrouping?.interval || "none"}
            onChange={(e) =>
              updateDateGrouping({
                interval: e.target.value,
              })
            }
            className="w-full border rounded-md px-2 py-2 text-sm"
          >
            <option value="none">No grouping</option>
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="quarter">Quarter</option>
            <option value="year">Year</option>
          </select>
        </section>
      </div>
    </div>
  );
}
export default ChartFiltersPanel;