import {
  useEffect,
  useRef,
  useState,
} from "react";

function SettingColor({
  label,
  value,
  fallback = "#000000",

  /*
   * Called continuously for a smooth chart preview.
   * This should update appearance without recording history.
   */
  onPreview,

  /*
   * Called once when the user finishes choosing.
   * This should create the undo-history action.
   */
  onChange,
}) {
  const normalizedValue =
    value || fallback;

  const [draftColor, setDraftColor] =
    useState(normalizedValue);

  const committedColorRef =
    useRef(normalizedValue);

  const pendingColorRef =
    useRef(normalizedValue);

  const animationFrameRef =
    useRef(null);

  useEffect(() => {
    setDraftColor(normalizedValue);

    committedColorRef.current =
      normalizedValue;

    pendingColorRef.current =
      normalizedValue;
  }, [normalizedValue]);

  useEffect(() => {
    return () => {
      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current,
        );
      }
    };
  }, []);

  const previewColor = (
    nextColor,
  ) => {
    /*
     * Update the small sidebar preview immediately.
     */
    setDraftColor(nextColor);

    pendingColorRef.current =
      nextColor;

    /*
     * Only update the chart once per browser frame.
     * This normally gives a smooth 60 FPS preview.
     */
    if (
      animationFrameRef.current !==
      null
    ) {
      return;
    }

    animationFrameRef.current =
      requestAnimationFrame(() => {
        animationFrameRef.current =
          null;

        onPreview?.(
          pendingColorRef.current,
        );
      });
  };

  const commitColor = (
    nextColor = pendingColorRef.current,
  ) => {
    if (
      animationFrameRef.current !==
      null
    ) {
      cancelAnimationFrame(
        animationFrameRef.current,
      );

      animationFrameRef.current =
        null;
    }

    setDraftColor(nextColor);

    /*
     * Ensure the chart displays the final color.
     */
    onPreview?.(nextColor);

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

    onChange?.(
      nextColor,
      previousColor,
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

          /*
           * onInput fires continuously while the
           * color-selection circle is moving.
           */
          onInput={(event) =>
            previewColor(
              event.currentTarget.value,
            )
          }

          /*
           * Usually fires when the native picker
           * confirms the final selected color.
           */
          onChange={(event) =>
            commitColor(
              event.currentTarget.value,
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

export default SettingColor;