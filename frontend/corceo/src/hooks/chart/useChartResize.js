import {
  useCallback,
  useEffect,
  useRef,
} from "react";

function useChartResize({
  chartHeight,
  setChartHeight,
  visualizationState,
  commitVisualizationHistory,

  minHeight = 320,
  maxHeight = 1200,
}) {
  const resizeRef = useRef({
    resizing: false,
    startY: 0,
    startHeight: chartHeight,
    latestHeight: chartHeight,
  });

  const visualizationStateRef =
    useRef(visualizationState);

  // Keep the latest visualization state available
  // to document-level mouse handlers.
  useEffect(() => {
    visualizationStateRef.current =
      visualizationState;
  }, [visualizationState]);

  const handleResizeMove =
    useCallback(
      (event) => {
        const resizeState =
          resizeRef.current;

        if (!resizeState.resizing) {
          return;
        }

        const difference =
          event.clientY -
          resizeState.startY;

        const nextHeight =
          Math.max(
            minHeight,
            Math.min(
              maxHeight,
              resizeState.startHeight +
                difference
            )
          );

        resizeState.latestHeight =
          nextHeight;

        setChartHeight(
          nextHeight,
          {
            record: false,
          }
        );
      },
      [
        maxHeight,
        minHeight,
        setChartHeight,
      ]
    );

  const stopResize =
    useCallback(() => {
      const resizeState =
        resizeRef.current;

      if (!resizeState.resizing) {
        return;
      }

      resizeState.resizing = false;

      const startHeight =
        resizeState.startHeight;

      const finalHeight =
        resizeState.latestHeight;

      if (
        startHeight !== finalHeight
      ) {
        const currentState =
          visualizationStateRef.current;

        commitVisualizationHistory(
          {
            ...currentState,
            chartHeight:
              startHeight,
          },
          {
            ...currentState,
            chartHeight:
              finalHeight,
          }
        );
      }

      document.removeEventListener(
        "mousemove",
        handleResizeMove
      );
    }, [
      commitVisualizationHistory,
      handleResizeMove,
    ]);

  const startChartResize =
    useCallback(
      (event) => {
        event.preventDefault();

        resizeRef.current = {
          resizing: true,

          startY:
            event.clientY,

          startHeight:
            chartHeight,

          latestHeight:
            chartHeight,
        };

        document.addEventListener(
          "mousemove",
          handleResizeMove
        );

        /*
         * The browser automatically removes
         * this listener after the mouse is
         * released once.
         */
        document.addEventListener(
          "mouseup",
          stopResize,
          {
            once: true,
          }
        );
      },
      [
        chartHeight,
        handleResizeMove,
        stopResize,
      ]
    );

  // Safety cleanup if the editor is closed
  // during a resize operation.
  useEffect(() => {
    return () => {
      document.removeEventListener(
        "mousemove",
        handleResizeMove
      );

      document.removeEventListener(
        "mouseup",
        stopResize
      );
    };
  }, [
    handleResizeMove,
    stopResize,
  ]);

  return {
    startChartResize,
  };
}

export default useChartResize;