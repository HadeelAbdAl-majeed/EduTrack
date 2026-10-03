const API = "http://localhost:3000/instructors";

export function getInstructor(id) {
  return fetch(`${API}/${id}`).then((res) => {
    if (!res.ok) throw new Error("Instructor not found");
    return res.json();
  });
}

export function saveStudents(id, students) {
  return fetch(`${API}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ students }),
  }).then((res) => {
    if (!res.ok) throw new Error("Save failed");
    return res.json();
  });
}

export function fetchRandomName() {
  return fetch("https://randomuser.me/api/")
    .then((res) => res.json())
    .then((data) => `${data.results[0].name.first} ${data.results[0].name.last}`);
}
