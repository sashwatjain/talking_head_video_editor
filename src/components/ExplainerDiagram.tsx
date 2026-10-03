import {Easing, interpolate} from "remotion";

type Theme = {
  background: string;
  surface: string;
  primary: string;
  text: string;
  mutedText: string;
  fontFamily: string;
  displayFontFamily: string;
};

type Props = {
  headline: string;
  body: string;
  items: string[];
  flow: "sequence" | "branches";
  theme: Theme;
  frame: number;
  split: boolean;
};

const reveal = (frame: number, delay: number) =>
  interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const Glyph: React.FC<{index: number; color: string}> = ({index, color}) => {
  if (index === 0) {
    return (
      <svg aria-hidden="true" width="38" height="38" viewBox="0 0 38 38">
        <text x="19" y="29" fill={color} fontFamily="Georgia, serif" fontSize="31" textAnchor="middle">
          T
        </text>
      </svg>
    );
  }

  if (index === 1) {
    return (
      <svg aria-hidden="true" width="38" height="38" viewBox="0 0 38 38">
        <rect x="8" y="7" width="22" height="19" rx="2" fill="none" stroke={color} strokeWidth="2" />
        <rect x="5" y="12" width="22" height="19" rx="2" fill="none" stroke={color} strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" width="38" height="38" viewBox="0 0 38 38">
      <path d="M6 32h27" fill="none" stroke={color} strokeWidth="2" />
      <rect x="9" y="21" width="5" height="11" rx="1" fill={color} />
      <rect x="17" y="15" width="5" height="17" rx="1" fill={color} />
      <rect x="25" y="8" width="5" height="24" rx="1" fill={color} />
    </svg>
  );
};

const Node: React.FC<{
  label: string;
  index: number;
  opacity: number;
  offset: number;
  theme: Theme;
  compact: boolean;
  numbered?: boolean;
}> = ({label, index, opacity, offset, theme, compact, numbered = false}) => (
  <div
    style={{
      flex: 1,
      minWidth: 0,
      minHeight: compact ? 145 : 160,
      padding: compact ? "14px 10px" : "18px 12px",
      border: `1px solid ${theme.primary}70`,
      borderRadius: 14,
      backgroundColor: theme.surface,
      boxShadow: "0 14px 36px rgba(7,12,23,0.25)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      opacity,
      transform: `translateY(${offset}px)`,
      boxSizing: "border-box",
    }}
  >
    {numbered ? (
      <div
        style={{
          width: 38,
          height: 38,
          border: `1px solid ${theme.primary}`,
          borderRadius: "50%",
          color: theme.primary,
          fontFamily: theme.fontFamily,
          fontSize: 19,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {index + 1}
      </div>
    ) : (
      <Glyph index={index} color={theme.primary} />
    )}
    <div
      style={{
        color: theme.text,
        fontFamily: theme.fontFamily,
        fontSize: compact ? 17 : 20,
        fontWeight: 600,
        lineHeight: 1.25,
        textAlign: "center",
      }}
    >
      {label}
    </div>
  </div>
);

export const ExplainerDiagram: React.FC<Props> = ({
  headline,
  body,
  items,
  flow,
  theme,
  frame,
  split,
}) => {
  const titleSize = split ? 42 : 31;
  const maxWidth = split ? 1000 : 650;
  const safeItems = items.slice(0, 4);

  return (
    <div
      style={{
        width: "100%",
        maxWidth,
        margin: "0 auto",
        fontFamily: theme.fontFamily,
        padding: split ? "0 12px" : 0,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          color: theme.text,
          fontFamily: theme.displayFontFamily,
          fontSize: titleSize,
          lineHeight: 1.12,
          fontWeight: 600,
          marginBottom: body ? 12 : split ? 34 : 24,
        }}
      >
        {headline}
      </div>
      {body && (
        <div
          style={{
            color: theme.mutedText,
            fontSize: split ? 22 : 18,
            lineHeight: 1.45,
            marginBottom: split ? 34 : 24,
          }}
        >
          {body}
        </div>
      )}

      {flow === "sequence" ? (
        <div style={{display: "flex", alignItems: "center", gap: split ? 18 : 10}}>
          {safeItems.map((item, index) => (
            <div key={`${item}-${index}`} style={{display: "flex", flex: 1, minWidth: 0, alignItems: "center", gap: split ? 18 : 10}}>
              <Node
                label={item}
                index={index}
                opacity={reveal(frame, index * 12)}
                offset={interpolate(reveal(frame, index * 12), [0, 1], [18, 0])}
                theme={theme}
                compact={!split}
                numbered
              />
              {index < safeItems.length - 1 && (
                <svg
                  aria-hidden="true"
                  width={split ? 58 : 36}
                  height="24"
                  viewBox="0 0 58 24"
                  style={{flexShrink: 0, overflow: "visible"}}
                >
                  <defs>
                    <marker id={`arrow-${index}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <path d="M0 0L8 4L0 8Z" fill={theme.primary} />
                    </marker>
                  </defs>
                  <path
                    d="M2 12H53"
                    fill="none"
                    stroke={theme.primary}
                    strokeWidth="2"
                    strokeDasharray="52"
                    strokeDashoffset={52 * (1 - reveal(frame, index * 12 + 8))}
                    markerEnd={`url(#arrow-${index})`}
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{position: "relative", width: "100%", height: split ? 410 : 310}}>
          <svg
            aria-hidden="true"
            viewBox="0 0 1000 390"
            preserveAspectRatio="none"
            style={{position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible"}}
          >
            {[0, 1, 2].map((index) => {
              const points = [170, 500, 830];
              const draw = reveal(frame, 14 + index * 9);
              return (
                <path
                  key={index}
                  d={`M500 108 V168 H${points[index]} V238`}
                  fill="none"
                  stroke={theme.primary}
                  strokeWidth="3"
                  strokeDasharray="620"
                  strokeDashoffset={620 * (1 - draw)}
                />
              );
            })}
          </svg>

          <div
            style={{
              position: "absolute",
              top: 10,
              left: "50%",
              transform: `translate(-50%, ${interpolate(reveal(frame, 0), [0, 1], [16, 0])}px)`,
              opacity: reveal(frame, 0),
              minWidth: split ? 300 : 240,
              padding: "17px 30px",
              border: `1px solid ${theme.primary}`,
              borderRadius: 14,
              backgroundColor: theme.surface,
              boxShadow: "0 14px 36px rgba(7,12,23,0.3)",
              color: theme.text,
              fontFamily: theme.displayFontFamily,
              fontSize: split ? 28 : 24,
              fontWeight: 700,
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            Remotion
          </div>

          <div
            style={{
              position: "absolute",
              top: "61%",
              left: 0,
              width: "100%",
              display: "flex",
              gap: "5%",
            }}
          >
            {safeItems.slice(0, 3).map((item, index) => (
              <div key={`${item}-${index}`} style={{flex: 1, minWidth: 0}}>
                <Node
                  label={item}
                  index={index}
                  opacity={reveal(frame, 14 + index * 9)}
                  offset={interpolate(reveal(frame, 14 + index * 9), [0, 1], [20, 0])}
                  theme={theme}
                  compact={!split}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
