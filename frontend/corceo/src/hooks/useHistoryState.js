import {
  useCallback,
  useState,
} from "react";

function cloneValue(value) {
  if (
    typeof structuredClone === "function"
  ) {
    return structuredClone(value);
  }

  return JSON.parse(
    JSON.stringify(value)
  );
}

function areEqual(
  firstValue,
  secondValue,
  equalityFn
) {
  if (equalityFn) {
    return equalityFn(
      firstValue,
      secondValue
    );
  }

  return (
    JSON.stringify(firstValue) ===
    JSON.stringify(secondValue)
  );
}

function useHistoryState(
  initialValue,
  {
    maxHistory = 50,
    equalityFn = null,
  } = {}
) {
  // =========================
  // HISTORY STATE
  // =========================

  const [history, setHistory] =
    useState(() => {
      const initial =
        typeof initialValue ===
        "function"
          ? initialValue()
          : initialValue;

      return {
        past: [],
        present:
          cloneValue(initial),
        future: [],
      };
    });

  // =========================
  // SET STATE
  // =========================

  const set = useCallback(
    (
      nextValueOrUpdater,
      options = {}
    ) => {
      const {
        record = true,
      } = options;

      setHistory(
        (currentHistory) => {
          const currentValue =
            currentHistory.present;

          const nextValue =
            typeof nextValueOrUpdater ===
            "function"
              ? nextValueOrUpdater(
                  cloneValue(
                    currentValue
                  )
                )
              : nextValueOrUpdater;

          const clonedNextValue =
            cloneValue(
              nextValue
            );

          if (
            areEqual(
              currentValue,
              clonedNextValue,
              equalityFn
            )
          ) {
            return currentHistory;
          }

          // Change state without
          // adding an undo step.
          if (!record) {
            return {
              ...currentHistory,

              present:
                clonedNextValue,
            };
          }

          const updatedPast = [
            ...currentHistory.past,

            cloneValue(
              currentValue
            ),
          ].slice(
            -maxHistory
          );

          return {
            past:
              updatedPast,

            present:
              clonedNextValue,

            future: [],
          };
        }
      );
    },
    [
      equalityFn,
      maxHistory,
      setHistory,
    ]
  );

  // =========================
  // COMMIT MANUAL CHANGE
  // =========================

  const commit = useCallback(
    (
      previousValue,
      nextValue
    ) => {
      const previous =
        cloneValue(
          previousValue
        );

      const next =
        cloneValue(
          nextValue
        );

      if (
        areEqual(
          previous,
          next,
          equalityFn
        )
      ) {
        return;
      }

      setHistory(
        (currentHistory) => ({
          past: [
            ...currentHistory.past,
            previous,
          ].slice(
            -maxHistory
          ),

          present:
            next,

          future: [],
        })
      );
    },
    [
      equalityFn,
      maxHistory,
      setHistory,
    ]
  );

  // =========================
  // UNDO
  // =========================

  const undo = useCallback(
    () => {
      setHistory(
        (currentHistory) => {
          if (
            currentHistory
              .past.length === 0
          ) {
            return currentHistory;
          }

          const previous =
            currentHistory.past[
              currentHistory
                .past.length - 1
            ];

          return {
            past:
              currentHistory.past.slice(
                0,
                -1
              ),

            present:
              cloneValue(
                previous
              ),

            future: [
              cloneValue(
                currentHistory.present
              ),

              ...currentHistory.future,
            ],
          };
        }
      );
    },
    [setHistory]
  );

  // =========================
  // REDO
  // =========================

  const redo = useCallback(
    () => {
      setHistory(
        (currentHistory) => {
          if (
            currentHistory
              .future.length === 0
          ) {
            return currentHistory;
          }

          const next =
            currentHistory.future[0];

          return {
            past: [
              ...currentHistory.past,

              cloneValue(
                currentHistory.present
              ),
            ].slice(
              -maxHistory
            ),

            present:
              cloneValue(
                next
              ),

            future:
              currentHistory.future.slice(
                1
              ),
          };
        }
      );
    },
    [
      maxHistory,
      setHistory,
    ]
  );

  // =========================
  // RESET
  // =========================

  const reset = useCallback(
    (
      nextValue,
      {
        clearHistory = true,
      } = {}
    ) => {
      const value =
        typeof nextValue ===
        "function"
          ? nextValue()
          : nextValue;

      const clonedValue =
        cloneValue(
          value
        );

      setHistory(
        (currentHistory) => {
          if (!clearHistory) {
            return {
              ...currentHistory,

              present:
                clonedValue,
            };
          }

          return {
            past: [],

            present:
              clonedValue,

            future: [],
          };
        }
      );
    },
    [setHistory]
  );

  // =========================
  // CLEAR HISTORY
  // =========================

  const clearHistory =
    useCallback(
      () => {
        setHistory(
          (currentHistory) => ({
            past: [],

            present:
              currentHistory.present,

            future: [],
          })
        );
      },
      [setHistory]
    );

  // =========================
  // RETURN
  // =========================

  return {
    state:
      history.present,

    setState:
      set,

    undo,
    redo,
    reset,
    clearHistory,
    commit,

    canUndo:
      history.past.length > 0,

    canRedo:
      history.future.length > 0,

    historyLength:
      history.past.length,
  };
}

export default useHistoryState;