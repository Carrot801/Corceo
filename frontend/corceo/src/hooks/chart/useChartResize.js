import {
  useCallback,
  useEffect,
  useRef,
} from "react";

function useChartResize({
  chartHeight,
  setChartHeight,
  chartElementRef,

  visualizationState,
  commitVisualizationHistory,

  minHeight = 320,
  maxHeight = 1200,
}) {
  // =========================
  // RESIZE STATE
  // =========================

  const resizeRef = useRef({
    resizing: false,
    startY: 0,
    startHeight: chartHeight,
    latestHeight: chartHeight,
  });

  // =========================
  // LATEST VISUALIZATION STATE
  // =========================

  const visualizationStateRef =
    useRef(visualizationState);

  useEffect(() => {
    visualizationStateRef.current =
      visualizationState;
  }, [visualizationState]);

  // =========================
  // RESIZE MOVE
  // =========================

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
                difference,
            ),
          );

        resizeState.latestHeight =
          nextHeight;

        /*
         * IMPORTANT:
         *
         * Do not update React state here.
         *
         * Updating chartHeight on every
         * mousemove would cause the whole
         * visualization and ChartPreview
         * to rerender continuously.
         *
         * During dragging we only change
         * the DOM height.
         */
        const chartElement =
          chartElementRef?.current;

        if (chartElement) {
          chartElement.style.height =
            `${nextHeight}px`;
        }
      },
      [
        chartElementRef,
        maxHeight,
        minHeight,
      ],
    );

  // =========================
  // STOP RESIZE
  // =========================

  const stopResize =
    useCallback(() => {
      const resizeState =
        resizeRef.current;

      if (!resizeState.resizing) {
        return;
      }

      resizeState.resizing =
        false;

      const startHeight =
        resizeState.startHeight;

      const finalHeight =
        resizeState.latestHeight;

      document.removeEventListener(
        "mousemove",
        handleResizeMove,
      );

      // =========================
      // COMMIT FINAL HEIGHT
      // =========================

      if (
        startHeight !==
        finalHeight
      ) {
        /*
         * Update React only once,
         * after resizing has finished.
         */
        setChartHeight(
          finalHeight,
          {
            record: false,
          },
        );

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
          },
        );
      }
    },
    [
      commitVisualizationHistory,
      handleResizeMove,
      setChartHeight,
    ],
  );

  // =========================
  // START RESIZE
  // =========================

  const startChartResize =
    useCallback(
      (event) => {
        event.preventDefault();

        const chartElement =
          chartElementRef?.current;

        /*
         * Use the real current DOM height.
         *
         * This prevents a mismatch between
         * React state and the visible chart.
         */
        const currentHeight =
          chartElement
            ? chartElement
                .getBoundingClientRect()
                .height
            : chartHeight;

        resizeRef.current = {
          resizing: true,

          startY:
            event.clientY,

          startHeight:
            currentHeight,

          latestHeight:
            currentHeight,
        };

        // Prevent accidental text selection
        // while dragging.
        document.body.style.userSelect =
          "none";

        document.body.style.cursor =
          "row-resize";

        document.addEventListener(
          "mousemove",
          handleResizeMove,
        );

        document.addEventListener(
          "mouseup",
          stopResize,
          {
            once: true,
          },
        );
      },
      [
        chartElementRef,
        chartHeight,
        handleResizeMove,
        stopResize,
      ],
    );

  // =========================
  // RESTORE BODY
  // =========================

  useEffect(() => {
    const handleMouseUp = () => {
      document.body.style.userSelect =
        "";

      document.body.style.cursor =
        "";
    };

    document.addEventListener(
      "mouseup",
      handleMouseUp,
    );

    return () => {
      document.removeEventListener(
        "mouseup",
        handleMouseUp,
      );
    };
  }, []);

  // =========================
  // CLEANUP
  // =========================

  useEffect(() => {
    return () => {
      document.removeEventListener(
        "mousemove",
        handleResizeMove,
      );

      document.removeEventListener(
        "mouseup",
        stopResize,
      );

      document.body.style.userSelect =
        "";

      document.body.style.cursor =
        "";
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