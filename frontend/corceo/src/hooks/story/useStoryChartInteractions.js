import {
  useCallback,
  useEffect,
  useRef } from
"react";

export default function useStoryChartInteractions({
  canvasRef,
  chartInteractionRef,

  updateChartItem,
  bringChartToFront,

  setSelectedChartId,
  setSelectedAnnoId,

  storyStateRef,
  commitStoryHistory
}) {




  const updateChartItemRef =
  useRef(updateChartItem);

  const bringChartToFrontRef =
  useRef(bringChartToFront);

  useEffect(() => {
    updateChartItemRef.current =
    updateChartItem;
  }, [updateChartItem]);

  useEffect(() => {
    bringChartToFrontRef.current =
    bringChartToFront;
  }, [bringChartToFront]);





  const animationFrameRef =
  useRef(null);

  const latestMousePositionRef =
  useRef(null);





  const applyChartInteractionMove =
  useCallback(
    (clientX, clientY) => {
      const interaction =
      chartInteractionRef.current;

      const canvas =
      canvasRef.current;

      if (
      !interaction ||
      !canvas)
      {
        return;
      }

      const rect =
      canvas.getBoundingClientRect();

      if (
      !rect.width ||
      !rect.height)
      {
        return;
      }





      const deltaX =

      (
      clientX -
      interaction.startClientX) /

      rect.width *

      100;

      const deltaY =

      (
      clientY -
      interaction.startClientY) /

      rect.height *

      100;





      if (
      interaction.mode ===
      "move")
      {
        updateChartItemRef.current(
          interaction.itemId,
          {
            x: Math.max(
              0,
              Math.min(
                100 -
                interaction.startWidth,
                interaction.startX +
                deltaX
              )
            ),

            y: Math.max(
              0,
              Math.min(
                100 -
                interaction.startHeight,
                interaction.startY +
                deltaY
              )
            )
          },
          {
            record: false
          }
        );

        return;
      }





      const minWidth = 18;
      const minHeight = 18;

      let x =
      interaction.startX;

      let y =
      interaction.startY;

      let width =
      interaction.startWidth;

      let height =
      interaction.startHeight;





      if (
      interaction.mode.includes(
        "right"
      ))
      {
        width = Math.max(
          minWidth,
          Math.min(
            100 -
            interaction.startX,
            interaction.startWidth +
            deltaX
          )
        );
      }





      if (
      interaction.mode.includes(
        "bottom"
      ))
      {
        height = Math.max(
          minHeight,
          Math.min(
            100 -
            interaction.startY,
            interaction.startHeight +
            deltaY
          )
        );
      }





      if (
      interaction.mode.includes(
        "left"
      ))
      {
        const nextX = Math.max(
          0,
          Math.min(
            interaction.startX +
            interaction.startWidth -
            minWidth,

            interaction.startX +
            deltaX
          )
        );

        x = nextX;

        width =
        interaction.startWidth +
        interaction.startX -
        nextX;
      }





      if (
      interaction.mode.includes(
        "top"
      ))
      {
        const nextY = Math.max(
          0,
          Math.min(
            interaction.startY +
            interaction.startHeight -
            minHeight,

            interaction.startY +
            deltaY
          )
        );

        y = nextY;

        height =
        interaction.startHeight +
        interaction.startY -
        nextY;
      }





      updateChartItemRef.current(
        interaction.itemId,
        {
          x,
          y,
          width,
          height
        },
        {
          record: false
        }
      );
    },
    [
    canvasRef,
    chartInteractionRef]

  );





  const handleChartInteractionMove =
  useCallback(
    (event) => {




      latestMousePositionRef.current = {
        clientX: event.clientX,
        clientY: event.clientY
      };








      if (
      animationFrameRef.current !==
      null)
      {
        return;
      }

      animationFrameRef.current =
      requestAnimationFrame(() => {
        animationFrameRef.current =
        null;

        const position =
        latestMousePositionRef.current;

        if (!position) {
          return;
        }

        applyChartInteractionMove(
          position.clientX,
          position.clientY
        );
      });
    },
    [
    applyChartInteractionMove]

  );





  const stopChartInteraction =
  useCallback(
    (event) => {
      const interaction =
      chartInteractionRef.current;

      document.removeEventListener(
        "mousemove",
        handleChartInteractionMove
      );



      if (
      animationFrameRef.current !==
      null)
      {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current =
        null;
      }







      if (
      interaction &&
      event &&
      typeof event.clientX ===
      "number" &&
      typeof event.clientY ===
      "number")
      {
        applyChartInteractionMove(
          event.clientX,
          event.clientY
        );
      }





      if (
      interaction?.
      startingStoryState)
      {
        commitStoryHistory(
          interaction.
          startingStoryState,

          storyStateRef.current
        );
      }





      chartInteractionRef.current =
      null;

      latestMousePositionRef.current =
      null;
    },
    [
    chartInteractionRef,
    commitStoryHistory,
    handleChartInteractionMove,
    applyChartInteractionMove,
    storyStateRef]

  );





  const startChartInteraction =
  useCallback(
    (
    event,
    mode,
    item) =>
    {
      event.preventDefault();
      event.stopPropagation();

      if (
      !canvasRef.current)
      {
        return;
      }





      const startingStoryState =
      structuredClone(
        storyStateRef.current
      );





      setSelectedChartId(
        item.id
      );

      setSelectedAnnoId(
        null
      );





      bringChartToFrontRef.current(
        item.id,
        {
          record: false
        }
      );





      chartInteractionRef.current = {
        mode,

        itemId:
        item.id,

        startClientX:
        event.clientX,

        startClientY:
        event.clientY,

        startX:
        item.x ?? 0,

        startY:
        item.y ?? 0,

        startWidth:
        item.width ?? 100,

        startHeight:
        item.height ?? 100,

        startingStoryState
      };

      latestMousePositionRef.current = {
        clientX:
        event.clientX,
        clientY:
        event.clientY
      };





      document.addEventListener(
        "mousemove",
        handleChartInteractionMove
      );

      document.addEventListener(
        "mouseup",
        stopChartInteraction,
        {
          once: true
        }
      );
    },
    [
    canvasRef,
    chartInteractionRef,
    handleChartInteractionMove,
    setSelectedAnnoId,
    setSelectedChartId,
    stopChartInteraction,
    storyStateRef]

  );





  useEffect(() => {
    return () => {
      document.removeEventListener(
        "mousemove",
        handleChartInteractionMove
      );

      document.removeEventListener(
        "mouseup",
        stopChartInteraction
      );

      if (
      animationFrameRef.current !==
      null)
      {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }
    };
  }, [
  handleChartInteractionMove,
  stopChartInteraction]
  );

  return {
    startChartInteraction
  };
}