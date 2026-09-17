import {
  useCallback,
  useEffect,
  useRef } from
"react";

function useChartResize({
  chartHeight,
  setChartHeight,
  chartElementRef,

  visualizationState,
  commitVisualizationHistory,

  minHeight = 320,
  maxHeight = 1200
}) {




  const resizeRef = useRef({
    resizing: false,
    startY: 0,
    startHeight: chartHeight,
    latestHeight: chartHeight
  });





  const visualizationStateRef =
  useRef(visualizationState);

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
    minHeight]

  );





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
      handleResizeMove
    );





    if (
    startHeight !==
    finalHeight)
    {




      setChartHeight(
        finalHeight,
        {
          record: false
        }
      );

      const currentState =
      visualizationStateRef.current;

      commitVisualizationHistory(
        {
          ...currentState,
          chartHeight:
          startHeight
        },
        {
          ...currentState,
          chartHeight:
          finalHeight
        }
      );
    }
  },
  [
  commitVisualizationHistory,
  handleResizeMove,
  setChartHeight]

  );





  const startChartResize =
  useCallback(
    (event) => {
      event.preventDefault();

      const chartElement =
      chartElementRef?.current;







      const currentHeight =
      chartElement ?
      chartElement.
      getBoundingClientRect().
      height :
      chartHeight;

      resizeRef.current = {
        resizing: true,

        startY:
        event.clientY,

        startHeight:
        currentHeight,

        latestHeight:
        currentHeight
      };



      document.body.style.userSelect =
      "none";

      document.body.style.cursor =
      "row-resize";

      document.addEventListener(
        "mousemove",
        handleResizeMove
      );

      document.addEventListener(
        "mouseup",
        stopResize,
        {
          once: true
        }
      );
    },
    [
    chartElementRef,
    chartHeight,
    handleResizeMove,
    stopResize]

  );





  useEffect(() => {
    const handleMouseUp = () => {
      document.body.style.userSelect =
      "";

      document.body.style.cursor =
      "";
    };

    document.addEventListener(
      "mouseup",
      handleMouseUp
    );

    return () => {
      document.removeEventListener(
        "mouseup",
        handleMouseUp
      );
    };
  }, []);





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

      document.body.style.userSelect =
      "";

      document.body.style.cursor =
      "";
    };
  }, [
  handleResizeMove,
  stopResize]
  );

  return {
    startChartResize
  };
}

export default useChartResize;