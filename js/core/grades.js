const form = document.getElementById('exam-form');
const examTable = document.getElementById('exam-tbody');
let db = 'http://localhost:3000/instructors';
let instructorId = 'inst_01';

form.addEventListener('submit', async (event) => {
	// console.log('here');
	event.preventDefault();
	let examScoreInput = document.getElementById('exam-score-input');
	let examScore = Number(examScoreInput.value);
	let examNameInput = document.getElementById('exam-name-input');
	let examName = examNameInput.value;
	let studentInput = document.getElementById('student-id-input');
	let studentId = studentInput.value;
	const instructorResponse = await fetch(db + '/' + instructorId);
	let instructorData = await instructorResponse.json();

	const studentIndex = instructorData.students.findIndex(s => s.id === studentId);
	if (studentIndex !== -1)
	{
		const newExam = {
			id: 'ex_' + Date.now(),
			name: examName,
			score: examScore
		};

		instructorData.students[studentIndex].exams.push(newExam);
		const updatedResponse = await fetch(db + '/' + instructorId, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({students: instructorData.students})
		});
		const updatedData = await updatedResponse.json();
	}
	console.log(data);
})

async function deleteExam(instructorId, studentId, examId) {
	try {
		// 1. Fetch the instructor data
		const response = await fetch(`${db}/${instructorId}`);
		let instructorData = await response.json();

		// 2. Find the student
		const studentIndex = instructorData.students.findIndex(s => s.id === studentId);
		if (studentIndex === -1)
			throw new Error("Student not found");

		// 3. Filter out the exam you want to delete
		const updatedExams = instructorData.students[studentIndex].exams.filter(exam => exam.id !== examId);
		instructorData.students[studentIndex].exams = updatedExams;

		// 4. Send PATCH request to update the database
		const updatedResponse = await fetch(`${db}/${instructorId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ students: instructorData.students })
		});

		const updatedData = await updatedResponse.json();
		console.log('Exam deleted successfully:', updatedData);

	} catch (error) {
		console.error('Error deleting exam:', error);
	}
}

async function editExam(instructorId, studentId, examId, newName, newScore) {
	try {
		// 1. Fetch the instructor data
		const response = await fetch(`${db}/${instructorId}`);
		let instructorData = await response.json();

		// 2. Find the student
		const studentIndex = instructorData.students.findIndex(s => s.id === studentId);
		if (studentIndex === -1) throw new Error("Student not found");

		// 3. Find the specific exam inside that student's array
		const examIndex = instructorData.students[studentIndex].exams.findIndex(e => e.id === examId);
		if (examIndex === -1) throw new Error("Exam not found");

		// 4. Update the properties
		instructorData.students[studentIndex].exams[examIndex].name = newName;
		instructorData.students[studentIndex].exams[examIndex].score = Number(newScore);

		// 5. Send PATCH request to update the database
		const updatedResponse = await fetch(`${db}/${instructorId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ students: instructorData.students })
		});

		const updatedData = await updatedResponse.json();
		console.log('Exam updated successfully:', updatedData);

	} catch (error) {
		console.error('Error updating exam:', error);
	}
}

// Example usage:
// editExam('inst_01', 'stu_001', 'ex_1', 'Updated Midterm Exam', 95);

// Example usage:
// deleteExam('inst_01', 'stu_001', 'ex_1');

async function renderTable() {
	try {
		const response = await fetch(`${db}/${instructorId}`);
		const data = await response.json();

		examTable.innerHTML = ''; // Clear existing rows

		let examCounter = 1; // Running counter for the row numbers

		// Loop through EVERY student in the array
		data.students.forEach(student => {
			if (student && student.exams) {

				// Loop through the exams for the current student
				student.exams.forEach(exam => {
					const tr = document.createElement('tr');


					// Note: Added data-student-id to the buttons so your
					// edit/delete logic knows which student to update
					tr.innerHTML = `
						<td>${examCounter++}</td>
						<td>${exam.name}</td>
						<td>${exam.score}</td>
						<td>${student.id}</td>
					`;
					// <td class="actions-cell" id='action-btns'>
					// 		<button class="btn-icon btn-edit" data-id="${exam.id}" data-student-id="${student.id}">
					// 			edit
					// 		</button>
					// 		<button class="btn-icon btn-delete" data-id="${exam.id}" data-student-id="${student.id}">
					// 			delete
					// 		</button>
					// </td>
					const actionCol = document.createElement('td');
					// console.log(actionCol);
					const editBtn = document.createElement('button');
					const deleteBtn = document.createElement('button');

					editBtn.textContent = 'edit';
					deleteBtn.textContent = 'delete';

					actionCol.appendChild(editBtn);
					actionCol.appendChild(deleteBtn);

					editBtn.addEventListener('click', async () => {
						const newName = prompt("Enter new exam name:", exam.name);
						const newScore = prompt("Enter new exam score:", exam.score);

						if (newName && newScore !== null) {
							await editExam(instructorId, student.id, exam.id, newName, newScore);
							renderTable(); // Re-render to show changes
						}
					});

					deleteBtn.addEventListener('click', async () => {
						const confirmDelete = confirm("Are you sure you want to delete this exam?");

						if (confirmDelete) {
							await deleteExam(instructorId, student.id, exam.id);
							renderTable(); // Re-render to show changes
						}
					});
					tr.appendChild(actionCol);
					examTable.appendChild(tr);
				});

			}
		});
	} catch (error) {
		console.error("Error loading table:", error);
	}
}

renderTable();
