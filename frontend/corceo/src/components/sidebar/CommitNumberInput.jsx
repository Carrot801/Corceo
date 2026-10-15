import { useEffect, useState } from "react";

export default function CommitNumberInput({
  value,
  onCommit,
  min,
  max,
  integer = false,
  allowEmpty = false,
  ...props
}) {
  const [draft, setDraft] = useState(String(value ?? ""));

  useEffect(() => {
    setDraft(String(value ?? ""));
  }, [value]);

  const commit = () => {
    const text = draft.trim();

    if (text === "") {
      if (allowEmpty) {
        if (value !== "") onCommit("");
      } else {
        setDraft(String(value ?? ""));
      }
      return;
    }

    let next = Number(text);

    if (!Number.isFinite(next)) {
      setDraft(String(value ?? ""));
      return;
    }

    if (integer) next = Math.trunc(next);
    if (min !== undefined) next = Math.max(Number(min), next);
    if (max !== undefined) next = Math.min(Number(max), next);

    setDraft(String(next));

    if (next !== value) {
      onCommit(next);
    }
  };

  return (
    <input
      {...props}
      type="number"
      min={min}
      max={max}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    />
  );
}