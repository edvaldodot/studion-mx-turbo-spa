/**
 * Receives an array of sessions from backend and returns
 * the array with parsed property names
 * @param {Array} rawSessions
 * @returns Array
 */
export const formatSessions = (rawSessions) => {
  return rawSessions.map((session) => {
    return {
      offering: session.offering_name || session.offeringName,
      solution: session.course_name || session.courseName,
      session: session.session_name || session.sessionName,
      status:
        session.status_name ||
        session.statusName ||
        session.status.alias ||
        session.paths_applications_users_status,
      certificateHash: session.certificate_hash || session.certificateHash,
      studentAllowedReenroll: session.studentAllowedReenroll,
      histories: session.histories,
      sessionEnrollments: session.session_enrollments,
      sessionId: session.session_id || session.sessionId,
      trail: session.path_name || session.pathName,
      date: session.enrolled_date || session.enrolledDate || session.enrollments_date,
      sessionStartDate: session.session_start_date,
      sessionEndDate: session.session_end_date,
    }
  })
}
