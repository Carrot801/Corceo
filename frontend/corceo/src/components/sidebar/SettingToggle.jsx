function SettingToggle({ label, checked, onChange }) {
  return (
    <label className="app-text-secondary flex cursor-pointer items-center gap-2 text-xs font-semibold">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[rgb(var(--color-primary))]"
      />

      {label}
    </label>
  );
}

export default SettingToggle;
