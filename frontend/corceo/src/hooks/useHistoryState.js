import {
  useCallback,
  useRef,
  useState,
} from "react";

function cloneValue(value) {
  if (
    typeof structuredClone === "function"
  ) {
    return structuredClone(value);
  }

  return JSON.parse(
    JSON.stringify(value),
  );
}

function useHistoryState(
  initialValue,
  {
    maxHistory = 50,
    equalityFn = null,
  } = {},
) {
  const initial =
    typeof initialValue === "function"
      ? initialValue()
      : initialValue;

    const commit = useCallback(
  (
    previousValue,
    nextValue,
  ) => {
    setHistory(
      (currentHistory) => {
        const previous =
          cloneValue(
            previousValue,
          );

        const next =
          cloneValue(nextValue);

        const isEqual = equalityFn
          ? equalityFn(
              previous,
              next,
            )
          : JSON.stringify(
              previous,
            ) ===
            JSON.stringify(next);

        if (isEqual) {
          return currentHistory;
        }

        return {
          past: [
            ...currentHistory.past,
            previous,
          ].slice(-maxHistory),

          present: next,
          future: [],
        };
      },
    );
  },
  [equalityFn, maxHistory],
);

  const [history, setHistory] =
    useState(() => ({
      past: [],
      present: cloneValue(initial),
      future: [],
    }));

  const historyRef = useRef(history);
  historyRef.current = history;

  const set = useCallback(
    (nextValueOrUpdater, options = {}) => {
      const { record = true } = options;

      setHistory((currentHistory) => {
        const currentValue =
          currentHistory.present;

        const nextValue =
          typeof nextValueOrUpdater ===
          "function"
            ? nextValueOrUpdater(
                cloneValue(currentValue),
              )
            : nextValueOrUpdater;

        const clonedNextValue =
          cloneValue(nextValue);

        const isEqual = equalityFn
          ? equalityFn(
              currentValue,
              clonedNextValue,
            )
          : JSON.stringify(currentValue) ===
            JSON.stringify(
              clonedNextValue,
            );

        if (isEqual) {
          return currentHistory;
        }

        if (!record) {
          return {
            ...currentHistory,
            present: clonedNextValue,
          };
        }

        const updatedPast = [
          ...currentHistory.past,
          cloneValue(currentValue),
        ].slice(-maxHistory);

        return {
          past: updatedPast,
          present: clonedNextValue,
          future: [],
        };
      });
    },
    [equalityFn, maxHistory],
  );

  const undo = useCallback(() => {
    setHistory((currentHistory) => {
      if (
        currentHistory.past.length ===
        0
      ) {
        return currentHistory;
      }

      const previous =
        currentHistory.past[
          currentHistory.past.length - 1
        ];

      return {
        past:
          currentHistory.past.slice(
            0,
            -1,
          ),
        present: cloneValue(previous),
        future: [
          cloneValue(
            currentHistory.present,
          ),
          ...currentHistory.future,
        ],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((currentHistory) => {
      if (
        currentHistory.future.length ===
        0
      ) {
        return currentHistory;
      }

      const next =
        currentHistory.future[0];

      return {
        past: [
          ...currentHistory.past,
          cloneValue(
            currentHistory.present,
          ),
        ].slice(-maxHistory),

        present: cloneValue(next),

        future:
          currentHistory.future.slice(
            1,
          ),
      };
    });
  }, [maxHistory]);

  const reset = useCallback(
    (
      nextValue,
      { clearHistory = true } = {},
    ) => {
      const value =
        typeof nextValue === "function"
          ? nextValue()
          : nextValue;

      setHistory((currentHistory) => {
        if (!clearHistory) {
          return {
            ...currentHistory,
            present:
              cloneValue(value),
          };
        }

        return {
          past: [],
          present: cloneValue(value),
          future: [],
        };
      });
    },
    [],
  );

  const clearHistory =
    useCallback(() => {
      setHistory((currentHistory) => ({
        past: [],
        present:
          currentHistory.present,
        future: [],
      }));
    }, []);

  return {
    state: history.present,
    setState: set,

    undo,
    redo,
    reset,
    clearHistory,

    commit, // Add this

    canUndo:
        history.past.length > 0,

    canRedo:
        history.future.length > 0,

    historyLength:
        history.past.length,
    };
}

export default useHistoryState;