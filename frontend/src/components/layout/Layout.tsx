import { Box } from "@mui/material";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const Layout = () => {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: "100vh",
        }}
      >
        <Navbar />

        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: "auto",
            p: { xs: 2, sm: 3, md: 4 },
            bgcolor: "background.default",
          }}
        >
          <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
            <Outlet />
          </Box>
        </Box>

        <Footer />
      </Box>
    </Box>
  );
};
