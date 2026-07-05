import { useEffect, useRef } from "react";
import { mountGradientCurveWidget } from "./gradient-curve-widget.js";

const STORAGE_KEY = "soundemote.gradientCurveWidget.site.v1";

const defaults = {
  angle: 120,
  invert: false,
  autoOrder: false,
  autoBright: false,
  autoBlack: false,
  autoWhite: false,
  hueMode: "chroma",
  lightnessMode: "bokeh",
  previewMode: "dot",
  radialCenter: "end",
  falloff: { leftEdge: 18, leftMid: 42, rightMid: 68, rightEdge: 100 },
  sampleCount: 40,
  stops: [
    { id: "black", color: "#000000" },
    { id: "red", color: "#FF1F2D" },
  ],
  savedStops: [
    { id: "brown", color: "#8A4B22" },
    { id: "white", color: "#FFFFFF" },
  ],
};

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") return defaults;
    return { ...defaults, ...saved };
  } catch {
    return defaults;
  }
}

const GradientCurveWidget = () => {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    mountGradientCurveWidget(host, {
      ...loadSettings(),
      onChange(packet: any) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            angle: packet.angle,
            invert: packet.invert,
            autoOrder: packet.autoOrder,
            autoBright: packet.autoBright,
            autoBlack: packet.autoBlack,
            autoWhite: packet.autoWhite,
            hueMode: packet.hueMode,
            lightnessMode: packet.lightnessMode,
            previewMode: packet.previewMode,
            radialCenter: packet.radialCenter,
            gridMode: packet.gridMode,
            falloff: packet.falloff,
            sampleCount: packet.sampleCount,
            stops: packet.stops
              .filter((stop: any) => !stop.id.startsWith("__auto-"))
              .map((stop: any) => ({ id: stop.id, color: stop.color })),
            savedStops: packet.savedStops.map((stop: any) => ({ id: stop.id, color: stop.color })),
          }),
        );
      },
    });

    return () => {
      host.replaceChildren();
    };
  }, []);

  return <div ref={hostRef} className="h-full w-full" />;
};

export default GradientCurveWidget;
