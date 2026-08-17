import {
  useCallback,
  useEffect,
  useRef,
} from "react";


export default function useStoryChartInteractions({
  canvasRef,
  chartInteractionRef,

  updateChartItem,
  bringChartToFront,

  setSelectedChartId,
  setSelectedAnnoId,

  storyStateRef,
  commitStoryHistory,
}) {
  /*
   * updateChartItem and bringChartToFront
   * can receive new function identities
   * after NewStory re-renders.
   *
   * Store their latest versions in refs
   * so the active mousemove handler remains
   * stable throughout the whole interaction.
   */
  const updateChartItemRef =
    useRef(updateChartItem);

  const bringChartToFrontRef =
    useRef(bringChartToFront);


  useEffect(() => {
    updateChartItemRef.current =
      updateChartItem;
  }, [
    updateChartItem,
  ]);


  useEffect(() => {
    bringChartToFrontRef.current =
      bringChartToFront;
  }, [
    bringChartToFront,
  ]);


  // =========================
  // CHART INTERACTION MOVE
  // =========================

  const handleChartInteractionMove =
    useCallback(
      (event) => {
        const interaction =
          chartInteractionRef.current;

        const canvas =
          canvasRef.current;

        if (
          !interaction ||
          !canvas
        ) {
          return;
        }

        const rect =
          canvas.getBoundingClientRect();

        if (
          !rect.width ||
          !rect.height
        ) {
          return;
        }


        // =========================
        // MOUSE DELTA %
        // =========================

        const deltaX =
          (
            (
              event.clientX -
              interaction.startClientX
            ) /
            rect.width
          ) *
          100;

        const deltaY =
          (
            (
              event.clientY -
              interaction.startClientY
            ) /
            rect.height
          ) *
          100;


        // =========================
        // MOVE
        // =========================

        if (
          interaction.mode ===
          "move"
        ) {
          updateChartItemRef.current(
            interaction.itemId,
            {
              x:
                Math.max(
                  0,
                  Math.min(
                    100 -
                      interaction.startWidth,

                    interaction.startX +
                      deltaX
                  )
                ),

              y:
                Math.max(
                  0,
                  Math.min(
                    100 -
                      interaction.startHeight,

                    interaction.startY +
                      deltaY
                  )
                ),
            },
            {
              record: false,
            }
          );

          return;
        }


        // =========================
        // RESIZE
        // =========================

        const minWidth =
          18;

        const minHeight =
          18;

        let x =
          interaction.startX;

        let y =
          interaction.startY;

        let width =
          interaction.startWidth;

        let height =
          interaction.startHeight;


        // =========================
        // RIGHT
        // =========================

        if (
          interaction.mode.includes(
            "right"
          )
        ) {
          width =
            Math.max(
              minWidth,

              Math.min(
                100 -
                  interaction.startX,

                interaction.startWidth +
                  deltaX
              )
            );
        }


        // =========================
        // BOTTOM
        // =========================

        if (
          interaction.mode.includes(
            "bottom"
          )
        ) {
          height =
            Math.max(
              minHeight,

              Math.min(
                100 -
                  interaction.startY,

                interaction.startHeight +
                  deltaY
              )
            );
        }


        // =========================
        // LEFT
        // =========================

        if (
          interaction.mode.includes(
            "left"
          )
        ) {
          const nextX =
            Math.max(
              0,

              Math.min(
                interaction.startX +
                  interaction.startWidth -
                  minWidth,

                interaction.startX +
                  deltaX
              )
            );

          x =
            nextX;

          width =
            interaction.startWidth +
            interaction.startX -
            nextX;
        }


        // =========================
        // TOP
        // =========================

        if (
          interaction.mode.includes(
            "top"
          )
        ) {
          const nextY =
            Math.max(
              0,

              Math.min(
                interaction.startY +
                  interaction.startHeight -
                  minHeight,

                interaction.startY +
                  deltaY
              )
            );

          y =
            nextY;

          height =
            interaction.startHeight +
            interaction.startY -
            nextY;
        }


        // =========================
        // APPLY RESIZE
        // =========================

        updateChartItemRef.current(
          interaction.itemId,
          {
            x,
            y,
            width,
            height,
          },
          {
            record: false,
          }
        );
      },
      [
        canvasRef,
        chartInteractionRef,
      ]
    );


  // =========================
  // STOP INTERACTION
  // =========================

  const stopChartInteraction =
    useCallback(() => {
      const interaction =
        chartInteractionRef.current;

      document.removeEventListener(
        "mousemove",
        handleChartInteractionMove
      );

      /*
       * mouseup is registered with
       * { once: true }, so the browser
       * removes that listener automatically.
       */

      if (
        interaction
          ?.startingStoryState
      ) {
        commitStoryHistory(
          interaction
            .startingStoryState,

          storyStateRef.current
        );
      }

      chartInteractionRef.current =
        null;
    }, [
      chartInteractionRef,
      commitStoryHistory,
      handleChartInteractionMove,
      storyStateRef,
    ]);


  // =========================
  // START INTERACTION
  // =========================

  const startChartInteraction =
    useCallback(
      (
        event,
        mode,
        item
      ) => {
        event.preventDefault();
        event.stopPropagation();

        if (
          !canvasRef.current
        ) {
          return;
        }


        // =========================
        // HISTORY SNAPSHOT
        // =========================

        const startingStoryState =
          structuredClone(
            storyStateRef.current
          );


        // =========================
        // SELECTION
        // =========================

        setSelectedChartId(
          item.id
        );

        setSelectedAnnoId(
          null
        );


        // =========================
        // Z-INDEX
        // =========================

        bringChartToFrontRef.current(
          item.id,
          {
            record: false,
          }
        );


        // =========================
        // INTERACTION CONTEXT
        // =========================

        chartInteractionRef.current = {
          mode,

          itemId:
            item.id,

          startClientX:
            event.clientX,

          startClientY:
            event.clientY,

          startX:
            item.x ??
            0,

          startY:
            item.y ??
            0,

          startWidth:
            item.width ??
            100,

          startHeight:
            item.height ??
            100,

          startingStoryState,
        };


        // =========================
        // DOCUMENT EVENTS
        // =========================

        document.addEventListener(
          "mousemove",
          handleChartInteractionMove
        );

        document.addEventListener(
          "mouseup",
          stopChartInteraction,
          {
            once: true,
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
        storyStateRef,
      ]
    );


  // =========================
  // CLEANUP
  // =========================

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
    };
  }, [
    handleChartInteractionMove,
    stopChartInteraction,
  ]);


  return {
    startChartInteraction,
  };
}