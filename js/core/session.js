export function getInstructorId() {
  return localStorage.getItem("edutrack_instructor_id") || "inst_01";
}
