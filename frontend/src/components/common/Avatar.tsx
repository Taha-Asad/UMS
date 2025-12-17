import { Avatar as MuiAvatar } from "@mui/material";

interface AvatarPropsCustom {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap: Record<NonNullable<AvatarPropsCustom["size"]>, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

export const Avatar = ({ name, size = "md" }: AvatarPropsCustom) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <MuiAvatar
      sx={{
        width: sizeMap[size],
        height: sizeMap[size],
        bgcolor: "primary.main",
        fontSize: size === "sm" ? "0.75rem" : size === "lg" ? "1.5rem" : "1rem",
      }}
    >
      {initials}
    </MuiAvatar>
  );
};
