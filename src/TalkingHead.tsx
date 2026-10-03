import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {RootShape} from "./Root.types";
import {CaptionTrack} from "./components/CaptionTrack";
import {SceneOverlay} from "./components/SceneOverlay";

type TalkingHeadProps = RootShape;

export const TalkingHead: React.FC<TalkingHeadProps> = ({
  sourceVideo,
  showCaptions,
  captions,
  scenes,
  theme,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const split = scenes.reduce<{
    progress: number;
    presentation: RootShape["scenes"][number]["presentation"];
  }>(
    (current, scene) => {
      if (scene.presentation === "full") {
        return current;
      }

      const startFrame = Math.floor(scene.startSeconds * fps);
      const endFrame = Math.ceil(scene.endSeconds * fps);
      const enter = interpolate(frame, [startFrame, startFrame + 18], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
      const exit = interpolate(frame, [endFrame - 18, endFrame], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
      const progress = Math.min(enter, exit);
      return progress > current.progress
        ? {progress, presentation: scene.presentation}
        : current;
    },
    {progress: 0, presentation: "full"},
  );
  const videoIsOnRight = split.presentation === "split-video-right";
  const videoWidth = interpolate(split.progress, [0, 1], [100, 33.333]);
  const videoLeft = videoIsOnRight ? interpolate(split.progress, [0, 1], [0, 66.667]) : 0;

  return (
    <AbsoluteFill style={{backgroundColor: theme.background, color: theme.text}}>
      {sourceVideo ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `${videoLeft}%`,
            width: `${videoWidth}%`,
            height: "100%",
            overflow: "hidden",
          }}
        >
          <OffthreadVideo
            src={staticFile(sourceVideo)}
            style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: "center"}}
          />
        </div>
      ) : (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: 100,
            textAlign: "center",
            fontFamily: theme.fontFamily,
          }}
        >
          <div style={{fontSize: 68, fontWeight: 700, marginTop: 24}}>
            Add your source video
          </div>
          <div style={{color: theme.mutedText, fontSize: 30, marginTop: 20}}>
            Copy media into public/ and set the sourceVideo prop in src/Root.tsx.
          </div>
        </AbsoluteFill>
      )}
      {scenes.map((scene) => (
        <SceneOverlay
          key={scene.id}
          scene={scene}
          theme={theme}
          fps={fps}
          frame={frame}
          splitProgress={scene.presentation === split.presentation ? split.progress : 0}
        />
      ))}
      {showCaptions && (
        <CaptionTrack
          captions={captions}
          theme={theme}
          fps={fps}
          frame={frame}
          splitPresentation={split.progress > 0 ? split.presentation : "full"}
          splitProgress={split.progress}
        />
      )}
    </AbsoluteFill>
  );
};
