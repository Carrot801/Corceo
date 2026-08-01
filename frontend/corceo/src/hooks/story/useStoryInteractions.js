import {
  useEffect,
  useRef,
} from "react";

export default function useStoryAutosave({
  enabled,
  dependencies,
  save,
  delay = 1200,
}) {
  const timerRef =
    useRef(null);

  useEffect(() => {
    if (!enabled) return;

    clearTimeout(
      timerRef.current,
    );

    timerRef.current =
      setTimeout(() => {
        save();
      }, delay);

    return () => {
      clearTimeout(
        timerRef.current,
      );
    };
    // dependencies are intentionally
    // supplied by the caller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
