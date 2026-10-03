import {AbsoluteFill, interpolate} from "remotion";
import {BarChart} from "./BarChart";
import {LowerThird} from "./LowerThird";
import {StatCard} from "./StatCard";

type Scene = {
  id: string;
  startSeconds: number;
  endSeconds: number;
  kind: "none" | "lower-third" | "quote" | "stat-card" | "bar-chart";
  headline: string;
  body: string;
  values: {label: string; value: number; unit: string}[];
};

type Theme = {
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  mutedText: string;
  fontFamily: string;
};

type Props = {scene: Scene; theme: Theme; fps: number; frame: number};

export const SceneOverlay: React.FC<Props> = ({scene, theme, fps, frame}) => {
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

  return (
    <AbsoluteFill style={{opacity, fontFamily: theme.fontFamily}}>
      {scene.kind === "lower-third" && (
        <AbsoluteFill style={{justifyContent: "flex-end", alignItems: "flex-start", padding: "0 8% 18%"}}>
          <LowerThird headline={scene.headline} body={scene.body} theme={theme} />
        </AbsoluteFill>
      )}
      {(scene.kind === "quote" || scene.kind === "stat-card") && (
        <AbsoluteFill style={{justifyContent: "center", alignItems: "center", padding: "8%"}}>
          <StatCard headline={scene.headline} body={scene.body} theme={theme} />
        </AbsoluteFill>
      )}
      {scene.kind === "bar-chart" && scene.values.length > 0 && (
        <AbsoluteFill style={{justifyContent: "center", alignItems: "flex-end", padding: "8%"}}>
          <BarChart
            values={scene.values}
            headline={scene.headline}
            body={scene.body}
            theme={theme}
            frame={frame - startFrame}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
