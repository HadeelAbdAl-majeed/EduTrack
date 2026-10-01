const form = document.getElementById('exam-form');
let db = 'http://localhost:3000/instructors';

form.addEventListener('submit', async (event) => {
	console.log('here');
	event.preventDefault();
	let examScoreInput = document.getElementById('exam-score-input');
	let examScore = Number(examScoreInput.value);
	let examNameInput = document.getElementById('exam-name-input');
	let examName = examNameInput.value;
	let instructorId = 'inst_01';
	let studentId = 'stu_001';
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
				'Content-Type': 'applicatiohn/json'
			},
			body: JSON.stringify({students: instructorData.students})
		});
		const updatedData = await updatedResponse.json();
	}
	console.log(data);
})
