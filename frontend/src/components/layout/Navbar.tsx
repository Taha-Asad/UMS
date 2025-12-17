import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  LightMode,
  DarkMode,
  Logout,
  Person,
  Settings,
} from "@mui/icons-material";
import { useState } from "react";
import { useLocation, Link } from "react-router";
import { useAuth } from "../../hooks";
import { useAuthStore, useUIStore } from "../../store";

const titleFromPath = (pathname: string): string => {
  if (pathname === "/") return "Welcome";
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "Welcome";
  const last = parts[parts.length - 1];
  return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const { user } = useAuthStore();
  const { toggleTheme, theme: uiTheme, toggleSidebar } = useUIStore();
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const title = titleFromPath(location.pathname);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    void logout();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ gap: 2, px: { xs: 2, sm: 3 } }}>
        <IconButton
          edge="start"
          color="inherit"
          onClick={toggleSidebar}
          sx={{ display: { lg: "none" }, mr: 1 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h1" fontWeight={600} noWrap>
            {title}
          </Typography>
          {user && (
            <Typography variant="caption" color="text.secondary" noWrap>
              Signed in as {user.full_name}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={toggleTheme}
            color="inherit"
            aria-label="Toggle theme"
          >
            {uiTheme === "dark" ? <LightMode /> : <DarkMode />}
          </IconButton>

          <IconButton
            component={Link}
            to="/notifications"
            color="inherit"
            sx={{ display: { xs: "none", sm: "inline-flex" } }}
          >
            <NotificationsIcon />
            <Chip
              label="3"
              size="small"
              color="primary"
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                height: 18,
                minWidth: 18,
                fontSize: "0.7rem",
              }}
            />
          </IconButton>

          {user && (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
                onClick={handleClick}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "primary.main",
                    fontSize: "0.875rem",
                  }}
                >
                  {user.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </Avatar>
                {!isMobile && (
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography variant="body2" fontWeight={500}>
                      {user.full_name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      textTransform="capitalize"
                    >
                      {user.role}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem component={Link} to="/profile" onClick={handleClose}>
                  <Person sx={{ mr: 1.5 }} fontSize="small" />
                  Profile
                </MenuItem>
                <MenuItem component={Link} to="/settings" onClick={handleClose}>
                  <Settings sx={{ mr: 1.5 }} fontSize="small" />
                  Settings
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1.5 }} fontSize="small" />
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
