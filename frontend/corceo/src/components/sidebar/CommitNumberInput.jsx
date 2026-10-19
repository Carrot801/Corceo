import { useEffect, useState } from "react";

export default function CommitNumberInput({
  value,
  onCommit,
  min,
  max,
  integer = false,
  allowEmpty = false,
  commitOnChange = false,
  ...props
}) {
  const [draft, setDraft] = useState(String(value ?? ""));

  useEffect(() => {
    setDraft(String(value ?? ""));
  }, [value]);

const commit = (rawValue = draft) => {
  const text = rawValue.trim();

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
onChange={(event) => {
  const startedAt = performance.now();
  const nextDraft = event.target.value;

  setDraft(nextDraft);

  if (commitOnChange && nextDraft.trim() !== "") {
    commit(nextDraft);
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const elapsed = performance.now() - startedAt;

      console.log(
        `Reakcja po wpisaniu "${nextDraft}": ${elapsed.toFixed(1)} ms`
      );
    });
  });
}}
onBlur={() => commit()}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    />
  );
}