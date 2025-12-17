import type { RouteObject } from "react-router";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
  Outlet,
} from "react-router";
import { Login } from "@pages/auth/Login";
import { Register } from "@pages/auth/Register";
import { ForgotPassword } from "@pages/auth/ForgotPassword";
import { ResetPassword } from "@pages/auth/ResetPassword";
import { Layout } from "@components/layout";
import { ProtectedRoute } from "./ProtectedRoute";
import { NotFound } from "@pages/errors/NotFound";
import { Unauthorized } from "@pages/errors/Unauthorized";
import { ServerError } from "@pages/errors/ServerError";
import { Dashboard as StudentDashboard } from "@pages/student/Dashboard";
import { MyCourses as StudentMyCourses } from "@pages/student/MyCourses";
import { Enrollment as StudentEnrollment } from "@pages/student/Enrollment";
import { Assignments as StudentAssignments } from "@pages/student/Assignments";
import { Attendance as StudentAttendance } from "@pages/student/Attendance";
import { Grades as StudentGrades } from "@pages/student/Grades";
import { Fees as StudentFees } from "@pages/student/Fees";
import { Timetable as StudentTimetable } from "@pages/student/Timetable";
import { Library as StudentLibrary } from "@pages/student/Library";
import { Dashboard as TeacherDashboard } from "@pages/teacher/Dashboard";
import { MyCourses as TeacherMyCourses } from "@pages/teacher/MyCourses";
import { Attendance as TeacherAttendance } from "@pages/teacher/Attendance";
import { Grades as TeacherGrades } from "@pages/teacher/Grades";
import { Assessments as TeacherAssessments } from "@pages/teacher/Assessments";
import { Timetable as TeacherTimetable } from "@pages/teacher/Timetable";
import { Dashboard as AdminDashboard } from "@pages/admin/Dashboard";
import { Users as AdminUsers } from "@pages/admin/Users";
import { Departments as AdminDepartments } from "@pages/admin/Departments";
import { Courses as AdminCourses } from "@pages/admin/Courses";
import { CourseOfferings as AdminCourseOfferings } from "@pages/admin/CourseOfferings";
import { Enrollments as AdminEnrollments } from "@pages/admin/Enrollments";
import { Timetable as AdminTimetable } from "@pages/admin/Timetable";
import { Assessments as AdminAssessments } from "@pages/admin/Assessments";
import { Semesters as AdminSemesters } from "@pages/admin/Semesters";
import { Fees as AdminFees } from "@pages/admin/Fees";
import { Library as AdminLibrary } from "@pages/admin/Library";
import { Reports as AdminReports } from "@pages/admin/Reports";
import { Settings as AdminSettings } from "@pages/admin/Settings";
import { Dashboard as LibrarianDashboard } from "@pages/librarian/Dashboard";
import { Books as LibrarianBooks } from "@pages/librarian/Books";
import { Issues as LibrarianIssues } from "@pages/librarian/Issues";
import { Returns as LibrarianReturns } from "@pages/librarian/Returns";
import { Profile } from "@pages/shared/Profile";
import { Settings as AccountSettings } from "@pages/shared/Settings";
import { Notifications } from "@pages/shared/Notifications";
import type { UserRole } from "@types";

const RootLayout = () => (
  <div className="page-container">
    <Outlet />
  </div>
);

const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ServerError />, // Fallback for unexpected router errors
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "unauthorized",
        element: <Unauthorized />,
      },
      // Protected application routes
      {
        element: <ProtectedRoute />, // Require authentication for everything below
        children: [
          {
            element: <Layout />, // Main app shell with sidebar/navbar
            children: [
              // Shared pages (any authenticated role)
              {
                path: "profile",
                element: <Profile />,
              },
              {
                path: "settings",
                element: <AccountSettings />,
              },
              {
                path: "notifications",
                element: <Notifications />,
              },

              // Student routes
              {
                element: (
                  <ProtectedRoute allowedRoles={["student" as UserRole]} />
                ),
                children: [
                  { path: "student/dashboard", element: <StudentDashboard /> },
                  { path: "student/courses", element: <StudentMyCourses /> },
                  {
                    path: "student/enrollment",
                    element: <StudentEnrollment />,
                  },
                  {
                    path: "student/assignments",
                    element: <StudentAssignments />,
                  },
                  {
                    path: "student/attendance",
                    element: <StudentAttendance />,
                  },
                  { path: "student/grades", element: <StudentGrades /> },
                  { path: "student/fees", element: <StudentFees /> },
                  { path: "student/timetable", element: <StudentTimetable /> },
                  { path: "student/library", element: <StudentLibrary /> },
                ],
              },

              // Teacher routes
              {
                element: (
                  <ProtectedRoute allowedRoles={["teacher" as UserRole]} />
                ),
                children: [
                  { path: "teacher/dashboard", element: <TeacherDashboard /> },
                  { path: "teacher/courses", element: <TeacherMyCourses /> },
                  {
                    path: "teacher/attendance",
                    element: <TeacherAttendance />,
                  },
                  { path: "teacher/grades", element: <TeacherGrades /> },
                  {
                    path: "teacher/assessments",
                    element: <TeacherAssessments />,
                  },
                  { path: "teacher/timetable", element: <TeacherTimetable /> },
                ],
              },

              // Admin routes
              {
                element: (
                  <ProtectedRoute allowedRoles={["admin" as UserRole]} />
                ),
                children: [
                  { path: "admin/dashboard", element: <AdminDashboard /> },
                  { path: "admin/users", element: <AdminUsers /> },
                  { path: "admin/departments", element: <AdminDepartments /> },
                  { path: "admin/courses", element: <AdminCourses /> },
                  { path: "admin/course-offerings", element: <AdminCourseOfferings /> },
                  { path: "admin/enrollments", element: <AdminEnrollments /> },
                  { path: "admin/timetable", element: <AdminTimetable /> },
                  { path: "admin/assessments", element: <AdminAssessments /> },
                  { path: "admin/semesters", element: <AdminSemesters /> },
                  { path: "admin/fees", element: <AdminFees /> },
                  { path: "admin/library", element: <AdminLibrary /> },
                  { path: "admin/reports", element: <AdminReports /> },
                  { path: "admin/settings", element: <AdminSettings /> },
                ],
              },

              // Librarian routes
              {
                element: (
                  <ProtectedRoute allowedRoles={["librarian" as UserRole]} />
                ),
                children: [
                  {
                    path: "librarian/dashboard",
                    element: <LibrarianDashboard />,
                  },
                  { path: "librarian/books", element: <LibrarianBooks /> },
                  { path: "librarian/issues", element: <LibrarianIssues /> },
                  { path: "librarian/returns", element: <LibrarianReturns /> },
                ],
              },

              // Catch-all inside app shell
              {
                path: "*",
                element: <NotFound />,
              },
            ],
          },
        ],
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export const AppRoutes = () => <RouterProvider router={router} />;
