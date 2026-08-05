function SettingSelect({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <div className="space-y-1.5">
      <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="app-input w-full text-sm"
      >
        {options.map((option) => {
          const optionValue =
            typeof option === "string"
              ? option
              : option.value;

          const optionLabel =
            typeof option === "string"
              ? option
              : option.label;

          return (
            <option
              key={optionValue}
              value={optionValue}
            >
              {optionLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default SettingSelect;