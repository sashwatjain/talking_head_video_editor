type Props = {
  headline: string;
  body: string;
  variant?: "quote" | "stat";
  children?: React.ReactNode;
  theme: {
    surface: string;
    primary: string;
    text: string;
    mutedText: string;
    fontFamily: string;
    displayFontFamily: string;
  };
};

export const StatCard: React.FC<Props> = ({headline, body, theme, variant = "stat", children}) => (
  <div
    style={{
      maxWidth: 650,
      padding: "26px 30px",
      borderRadius: 18,
      border: `1px solid ${theme.primary}66`,
      borderLeft: `4px solid ${theme.primary}`,
      backgroundColor: theme.surface,
      boxShadow: "0 20px 55px rgba(9,16,31,0.3)",
      fontFamily: theme.fontFamily,
    }}
  >
    <div
      style={{
        color: variant === "quote" ? theme.text : theme.primary,
        fontFamily: theme.displayFontFamily,
        fontSize: 32,
        fontWeight: variant === "quote" ? 500 : 700,
        lineHeight: 1.15,
      }}
    >
      {headline}
    </div>
    {body && (
      <div style={{color: theme.mutedText, fontSize: 18, lineHeight: 1.4, marginTop: 10}}>
        {body}
      </div>
    )}
    {children}
  </div>
);
