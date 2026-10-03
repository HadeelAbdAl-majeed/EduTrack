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
        totalPresents += p + (l * 0.5);
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

    students.forEach((student, index) => {
        const row = document.createElement("tr");
        row.className = "hover:bg-[#FAF6F3]/50 transition text-slate-700 font-medium text-sm";
        row.innerHTML = `
            <td class="p-4 text-center font-bold text-slate-400">${index + 1}</td>
            <td class="p-4">
                <div class="flex items-center gap-3">
                    <div class="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">👤</div>
                    <span class="font-bold text-[#2D1417]">${student.name}</span>
                </div>
            </td>
            <td class="p-4 text-center">
                <div class="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 text-xs font-bold">
                    <label class="flex items-center gap-1.5 cursor-pointer text-emerald-600 font-black"><input type="radio" name="att_${student.id}" value="present" class="accent-emerald-600"> Present</label>
                    <label class="flex items-center gap-1.5 cursor-pointer text-amber-600 font-black"><input type="radio" name="att_${student.id}" value="late" class="accent-amber-600"> Late</label>
                    <label class="flex items-center gap-1.5 cursor-pointer text-red-600 font-black"><input type="radio" name="att_${student.id}" value="absent" class="accent-red-600"> Absent</label>
                </div>
            </td>
            <td id="p_${student.id}" class="p-4 text-center font-black text-emerald-600 text-base">${student.attendance.present}</td>
            <td id="a_${student.id}" class="p-4 text-center font-black text-red-600 text-base">${student.attendance.absent}</td>
            <td id="l_${student.id}" class="p-4 text-center font-black text-amber-600 text-base">${student.attendance.late}</td>
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

    const todayDate = new Date().toISOString().split('T')[0];
    let hasUpdated = false;

    for (const student of loadedStudentsArray) {
        if (!student.attendance.lastAttendanceDate) {
            student.attendance.lastAttendanceDate = "";
        }

        if (student.attendance.lastAttendanceDate === todayDate) {
            continue; 
        }

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
        
        student.attendance.lastAttendanceDate = todayDate;
        await syncUpdatedStudentAttendance(CURRENT_INSTRUCTOR_ID, student.id, student.attendance);
        hasUpdated = true;
    }

    if (!hasUpdated) {
        alert("Attendance for today has already been saved and cannot be repeated!");
        return;
    }
    
    calculateClassAverage();
    alert("Attendance updated and saved successfully!");
}

document.getElementById("save-attendance-btn").addEventListener("click", handleSaveAttendance);

document.addEventListener("DOMContentLoaded", async () => {
    loadedStudentsArray = await fetchInstructorStudents(CURRENT_INSTRUCTOR_ID);
    renderStudentsTable(loadedStudentsArray);
    calculateClassAverage();
});


function markAllPresent() {
    loadedStudentsArray.forEach(student => {
        const presentRadio = document.querySelector(`input[name="att_${student.id}"][value="present"]`);
        if (presentRadio) {
            presentRadio.checked = true;
        }
    });
}

document.querySelector(".btn-outline").addEventListener("click", markAllPresent);