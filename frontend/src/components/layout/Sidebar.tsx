import { useMemo } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { NavLink, useLocation } from "react-router";
import {
  Dashboard as DashboardIcon,
  Book as BookIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  LibraryBooks as LibraryIcon,
  CalendarToday as CalendarIcon,
  Description as FileIcon,
  Settings as SettingsIcon,
  AccountBalanceWallet as WalletIcon,
  Notifications as BellIcon,
} from "@mui/icons-material";
import { useAuthStore, useUIStore } from "../../store";
import { APP_SHORT_NAME, ROLE_LABELS } from "../../utils/constants";
import type { UserRole } from "../../types";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

type RoleNavConfig = Record<UserRole, NavItem[]>;

const roleNavConfig: RoleNavConfig = {
  admin: [
    { label: "Dashboard", to: "/admin/dashboard", icon: <DashboardIcon /> },
    { label: "Users", to: "/admin/users", icon: <PeopleIcon /> },
    { label: "Departments", to: "/admin/departments", icon: <SchoolIcon /> },
    { label: "Courses", to: "/admin/courses", icon: <BookIcon /> },
    {
      label: "Course Offerings",
      to: "/admin/course-offerings",
      icon: <BookIcon />,
    },
    { label: "Enrollments", to: "/admin/enrollments", icon: <SchoolIcon /> },
    { label: "Timetable", to: "/admin/timetable", icon: <CalendarIcon /> },
    { label: "Assessments", to: "/admin/assessments", icon: <FileIcon /> },
    { label: "Semesters", to: "/admin/semesters", icon: <CalendarIcon /> },
    { label: "Fees", to: "/admin/fees", icon: <WalletIcon /> },
    { label: "Library", to: "/admin/library", icon: <LibraryIcon /> },
    { label: "Reports", to: "/admin/reports", icon: <FileIcon /> },
    { label: "Settings", to: "/admin/settings", icon: <SettingsIcon /> },
  ],
  teacher: [
    { label: "Dashboard", to: "/teacher/dashboard", icon: <DashboardIcon /> },
    { label: "My Courses", to: "/teacher/courses", icon: <BookIcon /> },
    { label: "Attendance", to: "/teacher/attendance", icon: <CalendarIcon /> },
    { label: "Grades", to: "/teacher/grades", icon: <FileIcon /> },
    { label: "Assessments", to: "/teacher/assessments", icon: <FileIcon /> },
    { label: "Timetable", to: "/teacher/timetable", icon: <CalendarIcon /> },
  ],
  student: [
    { label: "Dashboard", to: "/student/dashboard", icon: <DashboardIcon /> },
    { label: "My Courses", to: "/student/courses", icon: <BookIcon /> },
    { label: "Enrollment", to: "/student/enrollment", icon: <SchoolIcon /> },
    { label: "Assignments", to: "/student/assignments", icon: <FileIcon /> },
    { label: "Attendance", to: "/student/attendance", icon: <CalendarIcon /> },
    { label: "Grades", to: "/student/grades", icon: <FileIcon /> },
    { label: "Fees", to: "/student/fees", icon: <WalletIcon /> },
    { label: "Timetable", to: "/student/timetable", icon: <CalendarIcon /> },
    { label: "Library", to: "/student/library", icon: <LibraryIcon /> },
  ],
  staff: [
    { label: "Dashboard", to: "/admin/dashboard", icon: <DashboardIcon /> },
    { label: "Notifications", to: "/notifications", icon: <BellIcon /> },
  ],
  librarian: [
    { label: "Dashboard", to: "/librarian/dashboard", icon: <DashboardIcon /> },
    { label: "Books", to: "/librarian/books", icon: <LibraryIcon /> },
    { label: "Issues", to: "/librarian/issues", icon: <FileIcon /> },
    { label: "Returns", to: "/librarian/returns", icon: <FileIcon /> },
  ],
};

const drawerWidth = 280;
const collapsedWidth = 80;

export const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const location = useLocation();
  const { user } = useAuthStore();
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen } = useUIStore();

  const role = user?.role;

  const navItems = useMemo(() => {
    if (!role) return [];
    return roleNavConfig[role] ?? [];
  }, [role]);

  if (!role) {
    return null;
  }

  const roleLabel = ROLE_LABELS[role] ?? role;
  const width = sidebarCollapsed ? collapsedWidth : drawerWidth;

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "1.2rem",
          }}
        >
          {APP_SHORT_NAME.charAt(0)}
        </Box>
        {!sidebarCollapsed && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {APP_SHORT_NAME}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {roleLabel}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            location.pathname.startsWith(item.to + "/");
          return (
            <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={item.to}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  minHeight: 48,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "white" : "text.secondary",
                    minWidth: sidebarCollapsed ? 0 : 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!sidebarCollapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Quick Access */}
      {!sidebarCollapsed && (
        <Box sx={{ p: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              fontSize: "0.7rem",
            }}
          >
            Quick Access
          </Typography>
          <List sx={{ pt: 1 }}>
            {[
              { to: "/profile", label: "Profile" },
              { to: "/settings", label: "Settings" },
              { to: "/notifications", label: "Notifications" },
            ].map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <ListItem key={link.to} disablePadding>
                  <ListItemButton
                    component={NavLink}
                    to={link.to}
                    selected={isActive}
                    sx={{
                      borderRadius: 1,
                      py: 0.5,
                      "&.Mui-selected": {
                        bgcolor: "action.selected",
                      },
                    }}
                  >
                    <ListItemText
                      primary={link.label}
                      primaryTypographyProps={{
                        variant: "caption",
                        fontSize: "0.75rem",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "background.paper",
            borderRight: 1,
            borderColor: "divider",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: width,
          boxSizing: "border-box",
          bgcolor: "background.paper",
          borderRight: 1,
          borderColor: "divider",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};
