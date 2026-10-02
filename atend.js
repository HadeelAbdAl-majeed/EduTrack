const DATABASE_API_URL = "http://localhost:3000/instructors";
const CURRENT_INSTRUCTOR_ID = "inst_01";
let loadedStudentsArray = [];

async function fetchInstructorStudents(instructorId) {
    try {
        const response = await fetch(`${DATABASE_API_URL}/${instructorId}`);
        if (!response.ok) throw new Error();
        const instructorData = await response.json();
        return instructorData.students || [];
    } catch (error) {
        return [];
    }
}

async function syncUpdatedStudentAttendance(instructorId, studentId, freshAttendanceCounts) {
    try {
        const response = await fetch(`${DATABASE_API_URL}/${instructorId}`);
        if (!response.ok) throw new Error();
        const instructorData = await response.json();

        instructorData.students = instructorData.students.map(student => {
            if (student.id === studentId) {
                return { ...student, attendance: freshAttendanceCounts };
            }
            return student;
        });

        await fetch(`${DATABASE_API_URL}/${instructorId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(instructorData)
        });
    } catch (error) {
        return;
    }
}

function calculateClassAverage() {
    if (loadedStudentsArray.length === 0) return;
    
    let totalPresents = 0;
    let totalLecturesSegment = 0;

    loadedStudentsArray.forEach(student => {
        const p = student.attendance.present;
        const a = student.attendance.absent;
        const l = student.attendance.late;
        totalPresents += p + (l * 0.5); /*هاي عشان نحسب الليت  */
        totalLecturesSegment += (p + a + l);
    });

    if (totalLecturesSegment === 0) {
        document.getElementById("class-average-display").innerText = "0.0%";
        return;
    }

    const averagePercentage = (totalPresents / totalLecturesSegment) * 100;
    document.getElementById("class-average-display").innerText = `${averagePercentage.toFixed(1)}%`;
}

function renderStudentsTable(students) {
    const tableBody = document.getElementById("student-table-body");
    tableBody.innerHTML = "";

    students.forEach(student => {
        const row = document.createElement("tr");
        row.className = "border-b hover:bg-slate-50 transition";
        row.innerHTML = `
            <td class="p-3 font-semibold text-slate-800">${student.name}</td>
            <td class="p-3 text-center">
                <div class="inline-flex gap-4 text-xs font-medium">
                    <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="att_${student.id}" value="present"> P</label>
                    <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="att_${student.id}" value="absent"> A</label>
                    <label class="flex items-center gap-1 cursor-pointer"><input type="radio" name="att_${student.id}" value="late"> L</label>
                </div>
            </td>
            <td id="p_${student.id}" class="p-3 text-center font-bold text-green-600">${student.attendance.present}</td>
            <td id="a_${student.id}" class="p-3 text-center font-bold text-red-600">${student.attendance.absent}</td>
            <td id="l_${student.id}" class="p-3 text-center font-bold text-amber-600">${student.attendance.late}</td>
        `;
        tableBody.appendChild(row);
    });
}

async function handleSaveAttendance() {
    let allChecked = true;
    for (const student of loadedStudentsArray) {
        const selectedRadio = document.querySelector(`input[name="att_${student.id}"]:checked`);
        if (!selectedRadio) {
            allChecked = false;
            break;
        }
    }

    if (!allChecked) {
        alert("Error: Please mark attendance for all students before saving.");
        return;
    }

    for (const student of loadedStudentsArray) {
        const selectedRadio = document.querySelector(`input[name="att_${student.id}"]:checked`);
        const status = selectedRadio.value;
        
        if (status === "present") {
            student.attendance.present += 1;
            document.getElementById(`p_${student.id}`).innerText = student.attendance.present;
        } else if (status === "absent") {
            student.attendance.absent += 1;
            document.getElementById(`a_${student.id}`).innerText = student.attendance.absent;
        } else if (status === "late") {
            student.attendance.late += 1;
            document.getElementById(`l_${student.id}`).innerText = student.attendance.late;
        }
        
        await syncUpdatedStudentAttendance(CURRENT_INSTRUCTOR_ID, student.id, student.attendance);
    }
    
    calculateClassAverage();
    alert("Attendance updated and saved into db.json successfully!");
}

document.getElementById("save-attendance-btn").addEventListener("click", handleSaveAttendance);

document.addEventListener("DOMContentLoaded", async () => {
    loadedStudentsArray = await fetchInstructorStudents(CURRENT_INSTRUCTOR_ID);
    renderStudentsTable(loadedStudentsArray);
    calculateClassAverage();
});
