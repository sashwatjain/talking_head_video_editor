import {interpolate} from "remotion";

type Value = {label: string; value: number; unit: string};
type Props = {
  values: Value[];
  headline: string;
  body: string;
  theme: {
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    mutedText: string;
    fontFamily: string;
  };
  frame: number;
};

export const BarChart: React.FC<Props> = ({values, headline, body, theme, frame}) => {
  const max = Math.max(1, ...values.map((item) => Math.abs(item.value)));

  return (
    <div
      style={{
        width: 700,
        padding: "30px 36px",
        borderRadius: 22,
        backgroundColor: theme.surface,
        boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
        fontFamily: theme.fontFamily,
      }}
    >
      {headline && <div style={{color: theme.text, fontSize: 30, fontWeight: 700, marginBottom: 8}}>{headline}</div>}
      {body && <div style={{color: theme.mutedText, fontSize: 19, lineHeight: 1.35, marginBottom: 22}}>{body}</div>}
      {values.map((item, index) => {
        const width = interpolate(frame - index * 5, [0, 24], [0, (Math.abs(item.value) / max) * 50], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div key={`${item.label}-${index}`} style={{marginBottom: index === values.length - 1 ? 0 : 18}}>
            <div style={{display: "flex", justifyContent: "space-between", color: theme.text, fontSize: 21, marginBottom: 8}}>
              <span>{item.label}</span>
              <span style={{color: theme.mutedText}}>{item.value}{item.unit}</span>
            </div>
            <div style={{height: 18, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden", position: "relative"}}>
              <div
                style={{
                  width: `${width}%`,
                  height: "100%",
                  position: "absolute",
                  left: item.value >= 0 ? "50%" : undefined,
                  right: item.value < 0 ? "50%" : undefined,
                  borderRadius: 99,
                  backgroundColor: index % 2 === 0 ? theme.primary : theme.secondary,
                }}
              />
              <div style={{position: "absolute", left: "50%", width: 2, height: "100%", backgroundColor: theme.text, opacity: 0.6}} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
