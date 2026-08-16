import {
  useEffect,
  useRef,
  useState,
} from "react";

function SettingColorControl({
  label,
  initialValue,
  onPreview,
  onChange,
}) {
  const [
    draftColor,
    setDraftColor,
  ] = useState(initialValue);

  const committedColorRef =
    useRef(initialValue);

  const pendingColorRef =
    useRef(initialValue);

  const animationFrameRef =
    useRef(null);

  // =========================
  // CLEAN UP ANIMATION FRAME
  // =========================

  useEffect(() => {
    return () => {
      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }
    };
  }, []);

  // =========================
  // PREVIEW COLOR
  // =========================

  const previewColor = (
    nextColor
  ) => {
    // Update sidebar immediately.
    setDraftColor(
      nextColor
    );

    pendingColorRef.current =
      nextColor;

    // Only update the chart once
    // per animation frame.
    if (
      animationFrameRef.current !==
      null
    ) {
      return;
    }

    animationFrameRef.current =
      requestAnimationFrame(
        () => {
          animationFrameRef.current =
            null;

          onPreview?.(
            pendingColorRef.current
          );
        }
      );
  };

  // =========================
  // COMMIT FINAL COLOR
  // =========================

  const commitColor = (
    nextColor =
      pendingColorRef.current
  ) => {
    if (
      animationFrameRef.current !==
      null
    ) {
      cancelAnimationFrame(
        animationFrameRef.current
      );

      animationFrameRef.current =
        null;
    }

    setDraftColor(
      nextColor
    );

    // Make sure final color
    // is displayed.
    onPreview?.(
      nextColor
    );

    if (
      nextColor ===
      committedColorRef.current
    ) {
      return;
    }

    const previousColor =
      committedColorRef.current;

    committedColorRef.current =
      nextColor;

    pendingColorRef.current =
      nextColor;

    onChange?.(
      nextColor,
      previousColor
    );
  };

  return (
    <div>
      <label className="app-text-muted text-[10px] font-bold uppercase">
        {label}
      </label>

      <div className="app-input mt-1 flex h-10 items-center gap-2 px-2">
        <input
          type="color"
          value={draftColor}

          onInput={(event) =>
            previewColor(
              event.currentTarget.value
            )
          }

          onChange={(event) =>
            commitColor(
              event.currentTarget.value
            )
          }

          onBlur={() =>
            commitColor()
          }

          className="
            h-7 w-10 cursor-pointer
            border-none bg-transparent p-0
          "
        />

        <span
          className="h-5 w-5 shrink-0 rounded border"
          style={{
            backgroundColor:
              draftColor,
          }}
        />

        <span className="app-text-secondary min-w-0 flex-1 truncate font-mono text-xs">
          {draftColor.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

function SettingColor({
  label,
  value,
  fallback = "#000000",
  onPreview,
  onChange,
}) {
  const normalizedValue =
    value || fallback;

  return (
    <SettingColorControl
      key={normalizedValue}
      label={label}
      initialValue={
        normalizedValue
      }
      onPreview={onPreview}
      onChange={onChange}
    />
  );
}

export default SettingColor;