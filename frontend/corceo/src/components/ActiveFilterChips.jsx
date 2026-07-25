function ActiveFilterChips({
  filters = [],
  onRemoveFilterValue,
  onClearFilters,
}) {
  if (!filters.length) {
    return null;
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className="app-text-muted text-xs font-semibold">
        Active filters:
      </span>

      {filters.flatMap((filter, filterIndex) => {
        const values = Array.isArray(filter.value)
          ? filter.value
          : [filter.value];

        return values.map((value) => (
          <div
            key={`${filter.field}-${String(value)}`}
            className="app-surface app-border flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
          >
            <span className="font-semibold">
              {filter.field}
            </span>

            <span className="app-text-muted">=</span>

            <span>{String(value)}</span>

            <button
              type="button"
              onClick={() =>
                onRemoveFilterValue(filterIndex, value)
              }
              className="ml-1 font-bold text-red-500 hover:text-red-700"
              title={`Remove ${value}`}
            >
              ×
            </button>
          </div>
        ));
      })}

      <button
        type="button"
        onClick={onClearFilters}
        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
      >
        Clear all
      </button>
    </div>
  );
}

export default ActiveFilterChips;