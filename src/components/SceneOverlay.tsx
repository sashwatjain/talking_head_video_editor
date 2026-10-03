import {Easing, interpolate} from "remotion";
import {BarChart} from "./BarChart";
import {ExplainerDiagram} from "./ExplainerDiagram";
import {LowerThird} from "./LowerThird";
import {StatCard} from "./StatCard";
import type {RootShape} from "../Root.types";

type Scene = RootShape["scenes"][number];
type Theme = RootShape["theme"];
type Props = {
  scene: Scene;
  theme: Theme;
  fps: number;
  frame: number;
  splitProgress: number;
};

export const SceneOverlay: React.FC<Props> = ({scene, theme, fps, frame, splitProgress}) => {
  const startFrame = Math.floor(scene.startSeconds * fps);
  const endFrame = Math.ceil(scene.endSeconds * fps);
  if (scene.kind === "none" || frame < startFrame || frame >= endFrame) {
    return null;
  }

  const fadeFrames = Math.max(1, Math.min(12, Math.floor((endFrame - startFrame) / 3)));
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + fadeFrames, endFrame - fadeFrames, endFrame],
    [0, 1, 1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
  );
  const rise = interpolate(frame, [startFrame, startFrame + fadeFrames], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const inSplit = scene.presentation !== "full";
  const videoOnLeft = scene.presentation === "split-video-left";
  const positionStyle: React.CSSProperties =
    inSplit
      ? {
          position: "absolute",
          top: 0,
          left: videoOnLeft ? `${33.333 * splitProgress}%` : 0,
          width: `${66.667 * splitProgress}%`,
          height: "100%",
          padding: "0 5%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(145deg, ${theme.background}, ${theme.surface})`,
          borderLeft: videoOnLeft ? `2px solid ${theme.primary}88` : undefined,
          borderRight: videoOnLeft ? undefined : `2px solid ${theme.primary}88`,
          boxSizing: "border-box",
        }
      : scene.placement === "center"
      ? {left: "50%", top: "50%", width: "54%", transform: `translate(-50%, calc(-50% + ${rise}px))`}
      : scene.placement === "right"
        ? {right: "8%", top: "50%", width: "34%", transform: `translateY(calc(-50% + ${rise}px))`}
        : scene.placement === "lower-left"
          ? {left: "8%", top: "68%", width: "34%", transform: `translateY(${rise}px)`}
          : {left: "8%", top: "50%", width: "34%", transform: `translateY(calc(-50% + ${rise}px))`};

  return (
    <div
      style={{
        position: "absolute",
        opacity,
        fontFamily: theme.fontFamily,
        boxSizing: "border-box",
        ...positionStyle,
      }}
    >
      {scene.kind === "lower-third" && (
        <LowerThird headline={scene.headline} body={scene.body} theme={theme} />
      )}
      {(scene.kind === "quote" || scene.kind === "stat-card") && (
        <StatCard
          headline={scene.headline}
          body={scene.body}
          theme={theme}
          variant={scene.kind === "quote" ? "quote" : "stat"}
        />
      )}
      {scene.kind === "bar-chart" && scene.values.length > 0 && (
        <BarChart
          values={scene.values}
          headline={scene.headline}
          body={scene.body}
          theme={theme}
          frame={frame - startFrame}
        />
      )}
      {scene.kind === "flowchart" && (
        <ExplainerDiagram
          headline={scene.headline}
          body={scene.body}
          items={scene.items}
          flow={scene.flow}
          theme={theme}
          frame={frame - startFrame}
          split={inSplit}
        />
      )}
    </div>
  );
};
