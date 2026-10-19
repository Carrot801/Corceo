import { useCallback, useState } from "react";

function cloneValue(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function areEqual(first, second, equalityFn) {
  if (Object.is(first, second)) {
    return true;
  }

  if (equalityFn) {
    return equalityFn(first, second);
  }

  return JSON.stringify(first) === JSON.stringify(second);
}

function useHistoryState(
  initialValue,
  { maxHistory = 50, equalityFn = null } = {}
) {
  const [history, setHistory] = useState(() => {
    const initial =
      typeof initialValue === "function"
        ? initialValue()
        : initialValue;

    return {
      past: [],
      present: cloneValue(initial),
      future: [],
    };
  });

  const set = useCallback(
    (nextValueOrUpdater, { record = true } = {}) => {
      setHistory((currentHistory) => {
        const currentValue = currentHistory.present;

        const nextValue =
          typeof nextValueOrUpdater === "function"
            ? nextValueOrUpdater(currentValue)
            : nextValueOrUpdater;

        if (areEqual(currentValue, nextValue, equalityFn)) {
          return currentHistory;
        }

        if (!record) {
          return {
            ...currentHistory,
            present: nextValue,
          };
        }

        return {
          past: [
            ...currentHistory.past,
            currentValue,
          ].slice(-maxHistory),
          present: nextValue,
          future: [],
        };
      });
    },
    [equalityFn, maxHistory]
  );

  const commit = useCallback(
    (previousValue, nextValue) => {
      if (areEqual(previousValue, nextValue, equalityFn)) {
        return;
      }

      setHistory((currentHistory) => ({
        past: [
          ...currentHistory.past,
          previousValue,
        ].slice(-maxHistory),
        present: nextValue,
        future: [],
      }));
    },
    [equalityFn, maxHistory]
  );

  const undo = useCallback(() => {
    setHistory((currentHistory) => {
      if (currentHistory.past.length === 0) {
        return currentHistory;
      }

      const previous =
        currentHistory.past[currentHistory.past.length - 1];

      return {
        past: currentHistory.past.slice(0, -1),
        present: previous,
        future: [
          currentHistory.present,
          ...currentHistory.future,
        ],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((currentHistory) => {
      if (currentHistory.future.length === 0) {
        return currentHistory;
      }

      const next = currentHistory.future[0];

      return {
        past: [
          ...currentHistory.past,
          currentHistory.present,
        ].slice(-maxHistory),
        present: next,
        future: currentHistory.future.slice(1),
      };
    });
  }, [maxHistory]);

  const reset = useCallback(
    (nextValue, { clearHistory = true } = {}) => {
      const value =
        typeof nextValue === "function"
          ? nextValue()
          : nextValue;

      const clonedValue = cloneValue(value);

      setHistory((currentHistory) => {
        if (!clearHistory) {
          return {
            ...currentHistory,
            present: clonedValue,
          };
        }

        return {
          past: [],
          present: clonedValue,
          future: [],
        };
      });
    },
    []
  );

  const clearHistory = useCallback(() => {
    setHistory((currentHistory) => ({
      past: [],
      present: currentHistory.present,
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
    commit,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    historyLength: history.past.length,
  };
}

export default useHistoryState;