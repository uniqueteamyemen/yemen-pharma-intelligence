const compactIconUrl = "/manus-storage/pharmayemen-compact-icon_f700859f.png";

type CompactBrandIconProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function CompactBrandIcon({ size = "md", className = "" }: CompactBrandIconProps) {
  return (
    <span
      className={`compact-brand-icon compact-brand-icon--${size} ${className}`.trim()}
      aria-hidden="true"
    >
      <img src={compactIconUrl} alt="" />
    </span>
  );
}
