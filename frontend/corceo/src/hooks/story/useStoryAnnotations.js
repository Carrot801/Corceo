import {
  useCallback,
  useRef,
} from "react";

export default function useStoryInteractions({
  canvasRef,
  updateChartItem,
  setSelectedChartId,
  setSelectedAnnoId,
  storyStateRef,
  commitStoryHistory,
}) {
  const chartInteractionRef =
    useRef(null);

  // =========================
  // HANDLE MOUSE MOVE
  // =========================

  const handleMove =
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

        const deltaX =
          ((event.clientX -
            interaction.startClientX) /
            rect.width) *
          100;

        const deltaY =
          ((event.clientY -
            interaction.startClientY) /
            rect.height) *
          100;

        // =========================
        // MOVE CHART
        // =========================

        if (
          interaction.mode ===
          "move"
        ) {
          updateChartItem(
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
              ),
            },
            {
              record: false,
            }
          );

          return;
        }

        // =========================
        // RESIZE CHART
        // =========================

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

        // RIGHT
        if (
          interaction.mode.includes(
            "right"
          )
        ) {
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

        // BOTTOM
        if (
          interaction.mode.includes(
            "bottom"
          )
        ) {
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

        // LEFT
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

          x = nextX;

          width =
            interaction.startWidth +
            interaction.startX -
            nextX;
        }

        // TOP
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

          y = nextY;

          height =
            interaction.startHeight +
            interaction.startY -
            nextY;
        }

        updateChartItem(
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
        updateChartItem,
      ]
    );

  // =========================
  // STOP INTERACTION
  // =========================

  const stopInteraction =
    useCallback(() => {
      const interaction =
        chartInteractionRef.current;

      if (
        interaction
          ?.startingStoryState
      ) {
        commitStoryHistory(
          interaction.startingStoryState,
          storyStateRef.current
        );
      }

      chartInteractionRef.current =
        null;

      // Mouseup listener uses
      // { once: true }, so it removes
      // itself automatically.
      document.removeEventListener(
        "mousemove",
        handleMove
      );
    }, [
      commitStoryHistory,
      handleMove,
      storyStateRef,
    ]);

  // =========================
  // START INTERACTION
  // =========================

  const startInteraction =
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

        setSelectedChartId(
          item.id
        );

        setSelectedAnnoId(
          null
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

          startingStoryState:
            structuredClone(
              storyStateRef.current
            ),
        };

        // Track movement until
        // mouse is released.
        document.addEventListener(
          "mousemove",
          handleMove
        );

        // "once" means the browser
        // removes this listener after
        // the first mouseup.
        document.addEventListener(
          "mouseup",
          stopInteraction,
          {
            once: true,
          }
        );
      },
      [
        canvasRef,
        handleMove,
        setSelectedAnnoId,
        setSelectedChartId,
        stopInteraction,
        storyStateRef,
      ]
    );

  return {
    startChartInteraction:
      startInteraction,
  };
}