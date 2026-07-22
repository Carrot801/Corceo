function SettingRange({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="app-text-muted text-[11px] font-bold uppercase tracking-wider">
          {label}
        </label>

        <span className="app-text-secondary text-xs">
          {value}
          {unit}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="
          h-2 w-full cursor-pointer appearance-none rounded-lg
          bg-[rgb(var(--color-surface-hover))]
          accent-[rgb(var(--color-primary))]
        "
      />
    </div>
  );
}

export default SettingRange;

