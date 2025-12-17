import { useEffect, useState } from "react";
import { Box, TextField, IconButton, Tooltip } from "@mui/material";
import { Save, Edit } from "@mui/icons-material";
import { markApi, courseOfferingApi, assessmentApi } from "../../api";
import type { CourseOffering, Mark, Assessment } from "../../api";
import { PageHeader } from "../../components/layout";
import {
  Table,
  EmptyState,
  Spinner,
  Card,
  Button,
  Modal,
} from "../../components/common";
import { useAuthStore } from "../../store";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export const Grades = () => {
  const { user } = useAuthStore();
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [selectedOffering, setSelectedOffering] =
    useState<CourseOffering | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedMark, setSelectedMark] = useState<Mark | null>(null);
  const [gradeValue, setGradeValue] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      void loadOfferings();
    }
  }, [user]);

  const loadOfferings = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await courseOfferingApi.getByTeacher(user.user_id);
      setOfferings(res.data.data || []);
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewGrades = async (offering: CourseOffering) => {
    setSelectedOffering(offering);
    try {
      const [assessmentsRes, marksRes] = await Promise.all([
        assessmentApi.getByOffering(offering.offering_id),
        markApi.getMarksByAssessment(0).catch(() => ({ data: { data: [] } })),
      ]);
      setAssessments(assessmentsRes.data.data || []);
      // Load marks for all assessments
      const allMarks: Mark[] = [];
      for (const assessment of assessmentsRes.data.data || []) {
        try {
          const markRes = await markApi.getMarksByAssessment(
            assessment.assessment_id
          );
          allMarks.push(...(markRes.data.data || []));
        } catch {
          // Ignore errors for individual assessments
        }
      }
      setMarks(allMarks);
    } catch (error) {
      toast.error("Failed to load grades");
    }
  };

  const handleGrade = (mark: Mark) => {
    setSelectedMark(mark);
    setGradeValue(mark.marks_obtained?.toString() || "");
    setGradeModalOpen(true);
  };

  const handleSaveGrade = async () => {
    if (!selectedMark) return;
    try {
      await markApi.gradeSubmission(
        selectedMark.mark_id,
        parseFloat(gradeValue),
        ""
      );
      toast.success("Grade saved successfully");
      setGradeModalOpen(false);
      if (selectedOffering) {
        void handleViewGrades(selectedOffering);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Failed to save grade");
      } else {
        toast.error("Failed to save grade");
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Grades & assessments"
        description="Record and finalize grades for your students."
      />

      {offerings.length === 0 ? (
        <EmptyState
          title="No course offerings"
          description="You need course offerings to manage grades."
        />
      ) : (
        <Card
          title="Course Offerings"
          description="Select a course to view and grade assessments."
        >
          <Table
            data={offerings as unknown as Record<string, unknown>[]}
            columns={[
              { key: "course_code", header: "Code" },
              { key: "course_name", header: "Course" },
              { key: "semester_name", header: "Semester" },
              {
                key: "actions",
                header: "Actions",
                render: (row) => (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleViewGrades(row as CourseOffering)}
                  >
                    View Grades
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      )}

      {selectedOffering && assessments.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Card
            title={`Grades for ${selectedOffering.course_name}`}
            description="View and grade student submissions"
          >
            <Table
              data={marks as unknown as Record<string, unknown>[]}
              columns={[
                { key: "student_name", header: "Student" },
                { key: "assessment_title", header: "Assessment" },
                {
                  key: "marks_obtained",
                  header: "Marks",
                  render: (row) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box>
                        {row.marks_obtained !== null &&
                        row.marks_obtained !== undefined
                          ? `${row.marks_obtained}/${row.total_marks}`
                          : "Not graded"}
                      </Box>
                      <Tooltip title="Grade">
                        <IconButton
                          size="small"
                          onClick={() => handleGrade(row as Mark)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ),
                },
                {
                  key: "graded_at",
                  header: "Graded",
                  render: (row) =>
                    row.graded_at
                      ? new Date(row.graded_at as string).toLocaleDateString()
                      : "Pending",
                },
              ]}
            />
          </Card>
        </Box>
      )}

      <Modal
        open={gradeModalOpen}
        onClose={() => setGradeModalOpen(false)}
        title="Grade Submission"
        maxWidth="sm"
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Marks"
            type="number"
            fullWidth
            value={gradeValue}
            onChange={(e) => setGradeValue(e.target.value)}
            inputProps={{ min: 0, max: selectedMark?.total_marks }}
            helperText={`Out of ${selectedMark?.total_marks} marks`}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={() => setGradeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSaveGrade}>
              Save Grade
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};
