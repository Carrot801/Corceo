function ChartTypeSelector({
  chartTypes = [],
  chartConfig,
  setChartConfig,
}) {
  const previews = {
    bar: (
      <div className="flex items-end gap-[3px] h-8">
        <div className="w-2 h-3 bg-current rounded-sm opacity-60" />
        <div className="w-2 h-5 bg-current rounded-sm opacity-80" />
        <div className="w-2 h-7 bg-current rounded-sm" />
        <div className="w-2 h-4 bg-current rounded-sm opacity-70" />
      </div>
    ),

    line: (
      <svg
        viewBox="0 0 100 40"
        className="w-14 h-8"
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points="0,30 20,18 40,22 60,8 80,14 100,4"
        />
      </svg>
    ),

    pie: (
      <div className="relative w-8 h-8 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-current opacity-90" />

        <div
          className="absolute inset-0 bg-white/40"
          style={{
            clipPath:
              "polygon(50% 50%, 100% 0, 100% 100%)",
          }}
        />

        <div
          className="absolute inset-0 bg-black/10"
          style={{
            clipPath:
              "polygon(50% 50%, 0 0, 0 100%)",
          }}
        />
      </div>
    ),
  };

  return (
    <div className="space-y-2 p-4">
      {chartTypes.map((type) => {
        const isActive =
          chartConfig?.type === type.id;

        return (
          <button
            key={type.id}
            onClick={() =>
              setChartConfig((prev) => ({
                ...prev,
                type: type.id,
              }))
            }
            className={`
              w-full
              flex items-center justify-between
              px-3 py-2
              rounded-xl
              border
              transition-all
              ${
                isActive
                  ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }
            `}
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">
              
              <div
                className={`
                  w-10 h-10
                  rounded-lg
                  flex items-center justify-center
                  ${
                    isActive
                      ? "bg-white"
                      : "bg-slate-50"
                  }
                `}
              >
                {previews[type.id]}
              </div>

              <div className="text-left">
                <div className="text-sm font-semibold">
                  {type.label}
                </div>

                <div className="text-[11px] opacity-60">
                  {type.id} chart
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div
              className={`
                w-2 h-2 rounded-full
                ${
                  isActive
                    ? "bg-blue-500"
                    : "bg-slate-300"
                }
              `}
            />
          </button>
        );
      })}
    </div>
  );
}

export default ChartTypeSelector;