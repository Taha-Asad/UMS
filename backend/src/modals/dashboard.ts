import { pool } from "../config/db.ts";

export class DashboardModel {
  static async getStudentDashboard(studentId: number): Promise<any> {
    const [studentInfo] = await pool.execute<any[]>(
      `SELECT 
         u.full_name, u.roll_number, u.department, u.semester, u.cgpa,
         COUNT(DISTINCT CASE WHEN e.status = 'enrolled' THEN e.enrollment_id END) as current_courses,
         COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.enrollment_id END) as completed_courses,
         COALESCE(SUM(CASE WHEN f.status IN ('unpaid', 'partial', 'overdue') 
                          THEN (f.amount - f.discount + f.late_fee - f.paid_amount) 
                          ELSE 0 END), 0) as pending_fees
       FROM users u
       LEFT JOIN enrollments e ON u.user_id = e.student_id
       LEFT JOIN fees f ON u.user_id = f.student_id
       WHERE u.user_id = ?
       GROUP BY u.user_id`,
      [studentId]
    );

    const [recentNotices] = await pool.execute<any[]>(
      `SELECT title, content, category, created_at
       FROM notices
       WHERE (target_audience IN ('all', 'students'))
         AND (expiry_date IS NULL OR expiry_date >= CURDATE())
       ORDER BY is_important DESC, created_at DESC
       LIMIT 5`
    );

    const [upcomingAssessments] = await pool.execute<any[]>(
      `SELECT a.title, a.type, a.due_date, c.course_code, c.course_name
       FROM assessments a
       JOIN course_offerings co ON a.offering_id = co.offering_id
       JOIN courses c ON co.course_id = c.course_id
       JOIN enrollments e ON co.offering_id = e.offering_id
       WHERE e.student_id = ? AND e.status = 'enrolled'
         AND a.due_date >= NOW()
       ORDER BY a.due_date
       LIMIT 5`,
      [studentId]
    );

    return {
      studentInfo: studentInfo[0],
      recentNotices,
      upcomingAssessments,
    };
  }

  static async getTeacherDashboard(teacherId: number): Promise<any> {
    const [teacherInfo] = await pool.execute<any[]>(
      `SELECT 
         u.full_name, u.employee_id, u.department, u.designation,
         COUNT(DISTINCT co.offering_id) as total_courses,
         COALESCE(SUM(co.enrolled_students), 0) as total_students
       FROM users u
       LEFT JOIN course_offerings co ON u.user_id = co.teacher_id AND co.is_active = TRUE
       WHERE u.user_id = ?
       GROUP BY u.user_id`,
      [teacherId]
    );

    const [currentCourses] = await pool.execute<any[]>(
      `SELECT 
         c.course_code, 
         c.course_name, 
         CAST(COALESCE(co.enrolled_students, 0) AS UNSIGNED) as enrolled_students, 
         co.max_students,
         s.semester_name
       FROM course_offerings co
       JOIN courses c ON co.course_id = c.course_id
       JOIN semesters s ON co.semester_id = s.semester_id
       WHERE co.teacher_id = ? AND co.is_active = TRUE AND s.is_current = TRUE`,
      [teacherId]
    );

    const [pendingGrades] = await pool.execute<any[]>(
      `SELECT COUNT(*) as count
       FROM marks m
       JOIN assessments a ON m.assessment_id = a.assessment_id
       JOIN course_offerings co ON a.offering_id = co.offering_id
       WHERE co.teacher_id = ? AND m.graded_date IS NULL`,
      [teacherId]
    );

    return {
      teacherInfo: teacherInfo[0],
      currentCourses,
      pendingGrades: pendingGrades[0].count,
    };
  }

  static async getAdminDashboard(): Promise<any> {
    const [stats] = await pool.execute<any[]>(
      `SELECT 
         (SELECT COUNT(*) FROM users WHERE role = 'student' AND is_active = TRUE) as total_students,
         (SELECT COUNT(*) FROM users WHERE role = 'teacher' AND is_active = TRUE) as total_teachers,
         (SELECT COUNT(*) FROM courses WHERE is_active = TRUE) as total_courses,
         (SELECT COUNT(*) FROM departments WHERE is_active = TRUE) as total_departments`
    );

    const [revenueStats] = await pool.execute<any[]>(
      `SELECT 
         SUM(amount - discount) as total_fees_generated,
         SUM(paid_amount) as total_fees_collected,
         SUM((amount - discount + late_fee) - paid_amount) as outstanding_amount
       FROM fees
       WHERE semester_id IN (SELECT semester_id FROM semesters WHERE is_current = TRUE)`
    );

    const [recentActivities] = await pool.execute<any[]>(
      `SELECT table_name, operation, user_id, timestamp
       FROM audit_log
       ORDER BY timestamp DESC
       LIMIT 10`
    );

    return {
      stats: stats[0],
      revenueStats: revenueStats[0],
      recentActivities,
    };
  }
}
