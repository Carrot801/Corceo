function ActiveFilterChips({
  filters = [],
  onRemoveFilter,
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

      {filters.map((filter, index) => (
        <div
          key={`${filter.field}-${filter.value}-${index}`}
          className="app-surface app-border flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
        >
          <span className="font-semibold">
            {filter.field}
          </span>

          <span className="app-text-muted">
            {filter.operator === "equals" ? "=" : filter.operator}
          </span>

          <span>{String(filter.value)}</span>

          <button
            type="button"
            onClick={() => onRemoveFilter(index)}
            className="ml-1 font-bold text-red-500 hover:text-red-700"
            title="Remove filter"
          >
            ×
          </button>
        </div>
      ))}

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