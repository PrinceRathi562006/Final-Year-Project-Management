import { useEffect, useRef, useState } from "react";

const BowArrowClickEffect = () => {
  const [shot, setShot] = useState(null);
  const replayingClick = useRef(false);
  const suppressNextCanvasClick = useRef(false);

  useEffect(() => {
    let timeoutId;

    const handleClick = (event) => {
      if (replayingClick.current) return;

      const eventTarget = event.target instanceof Element ? event.target : null;
      const target = eventTarget?.closest("button, a[href], input[type='button'], input[type='submit'], input[type='reset'], [role='button'], canvas, [data-bow-target]") || eventTarget;

      if (target instanceof HTMLCanvasElement && suppressNextCanvasClick.current) {
        suppressNextCanvasClick.current = false;
        return;
      }
      if (!target || target.matches(":disabled, [aria-disabled='true']") || target.closest("[data-no-arrow-animation], .bow-shot-layer")) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const isLargeScreen = window.innerWidth >= 768;
      const startX = isLargeScreen ? 68 : 42;
      const startY = Math.max(isLargeScreen ? 92 : 50, window.innerHeight - (isLargeScreen ? 112 : 74));
      const endX = target instanceof HTMLCanvasElement ? event.clientX : rect.left + rect.width / 2;
      const endY = target instanceof HTMLCanvasElement ? event.clientY : rect.top + rect.height / 2;
      const dx = endX - startX;
      const dy = endY - startY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const angleRadians = angle * (Math.PI / 180);
      const arrowLength = isLargeScreen ? 55 : 38;
      const flightX = dx - arrowLength * Math.cos(angleRadians);
      const flightY = dy - arrowLength * Math.sin(angleRadians);

      setShot({ startX, startY, endX, endY, flightX, flightY, angle, isLargeScreen });
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setShot(null);
        if (!target.isConnected || target.matches(":disabled, [aria-disabled='true']")) return;

        replayingClick.current = true;
        try {
          if (target instanceof HTMLCanvasElement) {
            const pointerEvent = (type) => new PointerEvent(type, { bubbles: true, cancelable: true, clientX: event.clientX, clientY: event.clientY, pointerId: event.pointerId || 1, pointerType: event.pointerType || "mouse", isPrimary: true, button: 0 });
            target.dispatchEvent(pointerEvent("pointerdown"));
            target.dispatchEvent(pointerEvent("pointerup"));
          } else if (target instanceof HTMLElement) {
            target.click();
          } else {
            target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, clientX: event.clientX, clientY: event.clientY, button: event.button }));
          }
        } finally {
          replayingClick.current = false;
        }
      }, 1550);
    };

    const handlePointerUp = (event) => {
      if (replayingClick.current || !(event.target instanceof HTMLCanvasElement)) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const target = event.target;
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height || target.closest("[data-no-arrow-animation]")) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      handleClick(event);
      suppressNextCanvasClick.current = true;
      window.setTimeout(() => { suppressNextCanvasClick.current = false; }, 0);
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("pointerup", handlePointerUp, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("pointerup", handlePointerUp, true);
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!shot) return null;

  return (
    <div className="bow-shot-layer" aria-hidden="true">
      <svg className="bow-shot-svg" viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}>
        <circle className={`bow-shot-target${shot.isLargeScreen ? " is-large" : ""}`} cx={shot.endX} cy={shot.endY} r={shot.isLargeScreen ? 27 : 19} />
        <circle className={`bow-shot-target-center${shot.isLargeScreen ? " is-large" : ""}`} cx={shot.endX} cy={shot.endY} r={shot.isLargeScreen ? 6 : 4} />
        <path
          className={`bow-shot-bow${shot.isLargeScreen ? " is-large" : ""}`}
          d={`M ${shot.startX} ${shot.startY - (shot.isLargeScreen ? 36 : 25)} Q ${shot.startX + (shot.isLargeScreen ? 39 : 27)} ${shot.startY} ${shot.startX} ${shot.startY + (shot.isLargeScreen ? 36 : 25)}`}
        />
        <line
          className={`bow-shot-string${shot.isLargeScreen ? " is-large" : ""}`}
          x1={shot.startX}
          y1={shot.startY - (shot.isLargeScreen ? 36 : 25)}
          x2={shot.startX}
          y2={shot.startY + (shot.isLargeScreen ? 36 : 25)}
        />
      </svg>
      <div
        className={`bow-shot-arrow${shot.isLargeScreen ? " is-large" : ""}`}
        style={{
          left: shot.startX,
          top: shot.startY - (shot.isLargeScreen ? 3 : 2),
          "--flight-x": `${shot.flightX}px`,
          "--flight-y": `${shot.flightY}px`,
          "--shot-angle": `${shot.angle}deg`,
        }}
      >
        <span className="bow-shot-shaft" />
        <span className="bow-shot-head" />
        <span className="bow-shot-feather" />
      </div>
    </div>
  );
};

export default BowArrowClickEffect;
