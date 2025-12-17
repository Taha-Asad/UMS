import { useEffect, useState } from "react";
import { Box, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { Assignment, Upload, Visibility } from "@mui/icons-material";
import { assessmentApi, markApi } from "../../api";
import type { Assessment, Mark } from "../../types";
import { PageHeader } from "../../components/layout";
import {
  Table,
  EmptyState,
  Spinner,
  Card,
} from "../../components/common";
import { useAuthStore } from "../../store";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { format } from "date-fns";

export const Assignments = () => {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Record<number, Mark>>({});
  const [loading, setLoading] = useState(true);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      void loadAssignments();
      void loadSubmissions();
    }
  }, [user]);

  const loadAssignments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await assessmentApi.getUpcoming(user.user_id, 365); // Get all upcoming (within a year)
      const assignmentsData: Assessment[] = Array.isArray(res.data.data)
        ? res.data.data
        : [];
      // Filter to only assignments and map is_published to published if needed
      const mappedAssignments = assignmentsData.map(a => ({
        ...a,
        published: a.published !== undefined ? a.published : (a as any).is_published || false,
      }));
      setAssignments(mappedAssignments.filter(a => a.type === "assignment" && a.published));
    } catch (error) {
      console.error("Failed to load assignments:", error);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    if (!user) return;
    try {
      const res = await markApi.getMarksByStudent(user.user_id);
      const marksData: Mark[] = Array.isArray(res.data.data) ? res.data.data : [];
      const submissionsMap: Record<number, Mark> = {};
      marksData.forEach((mark) => {
        if (mark.assessment_id) {
          submissionsMap[mark.assessment_id] = mark;
        }
      });
      setSubmissions(submissionsMap);
    } catch (error) {
      console.error("Failed to load submissions:", error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssessment || !user) return;
    try {
      setSubmitting(true);
      await markApi.submitAssignment(
        selectedAssessment.assessment_id,
        user.user_id,
        { submission_text: submissionText || null }
      );
      toast.success("Assignment submitted successfully");
      setSubmitDialogOpen(false);
      setSelectedAssessment(null);
      setSubmissionText("");
      void loadSubmissions();
    } catch (error) {
      const msg =
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Submission failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openSubmitDialog = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    const existingSubmission = submissions[assessment.assessment_id];
    setSubmissionText(existingSubmission?.feedback || "");
    setSubmitDialogOpen(true);
  };

  const getStatus = (assessment: Assessment) => {
    const submission = submissions[assessment.assessment_id];
    if (!submission) return { label: "Not Submitted", color: "error" as const };
    if (submission.graded_at) {
      return {
        label: `Graded: ${submission.marks_obtained}/${submission.total_marks}`,
        color: "success" as const,
      };
    }
    return { label: "Submitted", color: "warning" as const };
  };

  return (
    <Box>
      <PageHeader
        title="Assignments"
        description="View and submit your course assignments."
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Spinner />
        </Box>
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No assignments found"
          description="You don't have any assignments at this time."
        />
      ) : (
        <Table
          data={assignments as unknown as Record<string, unknown>[]}
          columns={[
            { key: "course_code", header: "Course Code" },
            { key: "course_name", header: "Course" },
            { key: "title", header: "Assignment" },
            {
              key: "due_date",
              header: "Due Date",
              render: (row) => {
                const assessment = row as Assessment;
                const dueDate = new Date(assessment.due_date);
                const isOverdue = dueDate < new Date() && !submissions[assessment.assessment_id]?.graded_at;
                return (
                  <Box>
                    {format(dueDate, "MMM dd, yyyy")}
                    {isOverdue && (
                      <Chip label="Overdue" size="small" color="error" sx={{ ml: 1 }} />
                    )}
                  </Box>
                );
              },
            },
            {
              key: "status",
              header: "Status",
              render: (row) => {
                const assessment = row as Assessment;
                const status = getStatus(assessment);
                return <Chip label={status.label} size="small" color={status.color} />;
              },
            },
            {
              key: "actions",
              header: "Actions",
              render: (row) => {
                const assessment = row as Assessment;
                const submission = submissions[assessment.assessment_id];
                const isOverdue = new Date(assessment.due_date) < new Date();
                
                return (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {submission?.graded_at && (
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => {
                          toast.info(`Marks: ${submission.marks_obtained}/${submission.total_marks}${submission.feedback ? `\nFeedback: ${submission.feedback}` : ""}`);
                        }}
                      >
                        View Grade
                      </Button>
                    )}
                    {!submission?.graded_at && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Upload />}
                        onClick={() => openSubmitDialog(assessment)}
                        disabled={isOverdue && !submission}
                      >
                        {submission ? "Resubmit" : "Submit"}
                      </Button>
                    )}
                  </Box>
                );
              },
            },
          ]}
        />
      )}

      {/* Submit Dialog */}
      <Dialog
        open={submitDialogOpen}
        onClose={() => {
          setSubmitDialogOpen(false);
          setSelectedAssessment(null);
          setSubmissionText("");
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Submit Assignment: {selectedAssessment?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Submission Text"
              multiline
              rows={10}
              fullWidth
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Enter your assignment submission here..."
            />
            <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
              <strong>Due Date:</strong> {selectedAssessment && format(new Date(selectedAssessment.due_date), "MMM dd, yyyy 'at' hh:mm a")}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSubmitDialogOpen(false);
              setSelectedAssessment(null);
              setSubmissionText("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

