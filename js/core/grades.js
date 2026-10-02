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
						<td class="actions-cell">
							<button class="btn-icon btn-edit" data-id="${exam.id}" data-student-id="${student.id}">
								edit
							</button>
							<button class="btn-icon btn-delete" data-id="${exam.id}" data-student-id="${student.id}">
								delete
							</button>
						</td>
					`;
					examTable.appendChild(tr);
				});

			}
		});
	} catch (error) {
		console.error("Error loading table:", error);
	}
}

renderTable();
