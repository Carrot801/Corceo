function ChartTypeSelector({
  chartTypes = [],
  chartConfig,
  setChartConfig
}) {
  const previews = {
    bar:
    <div className="flex h-8 items-end gap-[3px]">
        <div className="h-3 w-2 rounded-sm bg-current opacity-60" />
        <div className="h-5 w-2 rounded-sm bg-current opacity-80" />
        <div className="h-7 w-2 rounded-sm bg-current" />
        <div className="h-4 w-2 rounded-sm bg-current opacity-70" />
      </div>,


    line:
    <svg viewBox="0 0 100 40" className="h-8 w-14">
        <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="0,30 20,18 40,22 60,8 80,14 100,4" />
      
      </svg>,


    pie:
    <div className="relative h-8 w-8 overflow-hidden rounded-full">
        <div className="absolute inset-0 bg-current opacity-90" />

        <div
        className="
            absolute inset-0
            bg-[rgb(var(--color-surface)/0.4)]
          "



        style={{
          clipPath: "polygon(50% 50%, 100% 0, 100% 100%)"
        }} />
      

        <div
        className="
            absolute inset-0
            bg-[rgb(var(--color-shadow)/0.1)]
          "



        style={{
          clipPath: "polygon(50% 50%, 0 0, 0 100%)"
        }} />
      
      </div>

  };

  const handleTypeChange = (typeId) => {
    setChartConfig((prev) => {
      const multiYCharts = ["bar", "line", "area", "composed"];
      const nextIsMultiYChart = multiYCharts.includes(typeId);

      return {
        ...prev,
        type: typeId,

        y: nextIsMultiYChart ?
        Array.isArray(prev.y) ?
        prev.y :
        prev.y ?
        [prev.y] :
        [] :
        Array.isArray(prev.y) ?
        prev.y.slice(0, 1) :
        prev.y ?
        [prev.y] :
        []
      };
    });
  };

  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {chartTypes.map((type) => {
        const isActive = chartConfig?.type === type.id;
        const Icon = type.Icon;

        return (
          <button
            type="button"
            key={type.id}
            onClick={() => handleTypeChange(type.id)}
            className={`
              flex min-w-0 items-center gap-2
              rounded-lg border px-2 py-2
              transition-all
              ${
            isActive ?
            `
                    border-[rgb(var(--color-primary))]
                    bg-[rgb(var(--color-primary-soft))]
                    text-[rgb(var(--color-primary))]
                  ` :
            `
                    border-[rgb(var(--color-border))]
                    bg-[rgb(var(--color-surface))]
                    text-[rgb(var(--color-text-secondary))]
                    hover:border-[rgb(var(--color-border-strong))]
                    hover:bg-[rgb(var(--color-surface-hover))]
                    hover:text-[rgb(var(--color-text))]
                  `}
            `
            }>
            
            {}
            <div className="flex items-center gap-3">
              <div
                className={`
                  flex h-8 w-8 shrink-0
                  items-center justify-center
                  rounded-lg
                  transition-colors
                  ${
                isActive ?
                `
                        bg-[rgb(var(--color-surface))]
                        text-[rgb(var(--color-primary))]
                      ` :
                `
                        bg-[rgb(var(--color-surface-secondary))]
                        text-[rgb(var(--color-text-secondary))]
                      `}
                `
                }>
                
                {Icon ?
                <Icon size={18} strokeWidth={2} /> :

                previews[type.id] ?? null
                }
              </div>

              <div
                className={`
                  min-w-0 truncate text-xs font-semibold
                  ${
                isActive ?
                "text-[rgb(var(--color-primary))]" :
                "text-[rgb(var(--color-text))]"}
                `
                }>
                
                {type.label}
              </div>
            </div>

          </button>);

      })}
    </div>);

}

export default ChartTypeSelector;