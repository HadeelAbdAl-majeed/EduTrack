const HELP =
  "Try: how many students, archived, active, absent, late, present, CS, IT, Business, or a student name.";
const DEPARTMENTS = ["cs", "it", "business"];
const ATTENDANCE = ["absent", "late", "present"];

function names(list) {
  return list.length ? list.map((s) => s.name).join(", ") : "none";
}

function answer(text, students) {
  const q = text.toLowerCase().trim();
  const words = q.split(/\W+/);
  const active = students.filter((s) => !s.archived);
  const archived = students.filter((s) => s.archived);

  if (!q || q.includes("help")) return HELP;

  const department = DEPARTMENTS.find((d) => words.includes(d));
  if (department) {
    const list = active.filter(
      (s) => s.department.toLowerCase() === department,
    );
    return `${list.length} active student(s) in ${department.toUpperCase()}: ${names(list)}.`;
  }

  if (q.includes("how many") || q.includes("count") || q.includes("total")) {
    return `You have ${students.length} students: ${active.length} active and ${archived.length} archived.`;
  }

  if (q.includes("archived")) return `Archived students: ${names(archived)}.`;
  if (q.includes("active")) return `Active students: ${names(active)}.`;

  const status = ATTENDANCE.find((a) => q.includes(a));
  if (status) {
    return `Active students marked ${status}: ${names(active.filter((s) => s.attendance === status))}.`;
  }

  const student = students.find((s) => {
    const full = s.name.toLowerCase();
    return q.includes(full) || q.includes(full.split(" ")[0]);
  });
  if (student) {
    return `${student.name} - ID ${student.studentId}, ${student.email}, ${student.department}, attendance: ${student.attendance}, ${student.archived ? "archived" : "active"}.`;
  }

  return `I did not understand that. ${HELP}`;
}

export function initChatbot(getStudents) {
  const toggle = document.getElementById("chat-toggle");
  const panel = document.getElementById("chat-panel");
  const close = document.getElementById("chat-close");
  const messages = document.getElementById("chat-messages");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");

  function addMessage(text, who) {
    const div = document.createElement("div");
    div.className = `msg ${who}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  toggle.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) {
      if (!messages.children.length) {
        addMessage(
          "Hi! Ask me about your students. Type help to see what I can do.",
          "bot",
        );
      }
      input.focus();
    }
  });

  close.addEventListener("click", () => (panel.hidden = true));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, "user");
    addMessage(answer(text, getStudents()), "bot");
    input.value = "";
  });
}
//pwd
//ls;

//cd edutrack
//ls;

//npx json-server server/db.json
