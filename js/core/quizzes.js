const db = 'http://localhost:3000/instructors';
const instructorId = 'inst_01';

// DOM Elements
const toggleBtn = document.getElementById('toggle-quiz-form-btn');
const cancelBtn = document.getElementById('cancel-quiz-btn');
const formContainer = document.getElementById('quiz-form-container');
const quizForm = document.getElementById('quiz-form');
const questionsContainer = document.getElementById('questions-container');
const addQuestionBtn = document.getElementById('add-question-btn');
const quizTbody = document.getElementById('quiz-tbody');

let questionCounter = 0;

// SVG Icons
const editIcon = `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
const deleteIcon = `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;

// --- 1. TOGGLE FORM VISIBILITY ---
toggleBtn.addEventListener('click', () => {
    formContainer.classList.remove('hidden');
    quizForm.reset();
    questionsContainer.innerHTML = ''; // Clear questions
    document.getElementById('editing-quiz-id').value = '';
    addQuestionBlock(); // Add one empty question by default
});

cancelBtn.addEventListener('click', () => {
    formContainer.classList.add('hidden');
});

// --- 2. DYNAMIC QUESTION GENERATION ---
addQuestionBtn.addEventListener('click', addQuestionBlock);

function addQuestionBlock() {
    questionCounter++;
    const qIndex = questionCounter;

    const block = document.createElement('div');
    block.className = 'question-block';

    // Generates a question text input, and 3 options.
    // The radio buttons share a 'name' so only one can be selected per question.
    block.innerHTML = `
        <div class="input-group">
            <label>Question ${qIndex}</label>
            <input type="text" class="q-text" placeholder="Enter question text..." required>
        </div>
        <div class="options-container">
            <label>Options (Select the correct answer):</label>
            <div class="option-row">
                <input type="radio" name="correct_${qIndex}" value="0" required>
                <input type="text" class="opt-text" placeholder="Option 1" required>
            </div>
            <div class="option-row">
                <input type="radio" name="correct_${qIndex}" value="1">
                <input type="text" class="opt-text" placeholder="Option 2" required>
            </div>
            <div class="option-row">
                <input type="radio" name="correct_${qIndex}" value="2">
                <input type="text" class="opt-text" placeholder="Option 3" required>
            </div>
        </div>
    `;
    questionsContainer.appendChild(block);
}

// --- 3. SAVE / SCRAPE FORM DATA ---
quizForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('quiz-title-input').value;
    const editingId = document.getElementById('editing-quiz-id').value;

    // Scrape the DOM to build our questions array
    const questionsArray = [];
    const questionBlocks = document.querySelectorAll('.question-block');

    questionBlocks.forEach((block, index) => {
        const text = block.querySelector('.q-text').value;
        const optionsInputs = block.querySelectorAll('.opt-text');

        // Convert option inputs to an array of strings
        const options = Array.from(optionsInputs).map(input => input.value);

        // Find which radio button is checked
        const correctRadio = block.querySelector(`input[type="radio"]:checked`);
        const correctIndex = correctRadio ? parseInt(correctRadio.value) : 0;

        questionsArray.push({
            id: 'q_' + Date.now() + '_' + index, // unique ID per question
            text: text,
            options: options,
            correctOptionIndex: correctIndex
        });
    });

    const newQuizData = {
        id: editingId ? editingId : 'quiz_' + Date.now(),
        title: title,
        questions: questionsArray
    };

    // Save to Database
    try {
        const response = await fetch(`${db}/${instructorId}`);
        let instructorData = await response.json();

        // Ensure the quizzes array exists
        if (!instructorData.quizzes) instructorData.quizzes = [];

        if (editingId) {
            // Update existing quiz
            const qIndex = instructorData.quizzes.findIndex(q => q.id === editingId);
            instructorData.quizzes[qIndex] = newQuizData;
        } else {
            // Add new quiz
            instructorData.quizzes.push(newQuizData);
        }

        await fetch(`${db}/${instructorId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quizzes: instructorData.quizzes })
        });

        formContainer.classList.add('hidden'); // Hide form on success
        renderQuizzesTable(); // Refresh table

    } catch (error) {
        console.error("Error saving quiz:", error);
    }
});

// --- 4. RENDER TABLE ---
async function renderQuizzesTable() {
    try {
        const response = await fetch(`${db}/${instructorId}`);
        const data = await response.json();

        quizTbody.innerHTML = '';

        // If no quizzes exist yet, exit early
        if (!data.quizzes) return;

        data.quizzes.forEach((quiz, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${quiz.title}</td>
                <td>${quiz.questions ? quiz.questions.length : 0}</td>
            `;

            const actionCol = document.createElement('td');
            actionCol.className = 'actions-cell';

            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-icon btn-delete';
            deleteBtn.innerHTML = deleteIcon;
            deleteBtn.addEventListener('click', async () => {
                if (confirm("Delete this quiz?")) {
                    const filteredQuizzes = data.quizzes.filter(q => q.id !== quiz.id);
                    await fetch(`${db}/${instructorId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ quizzes: filteredQuizzes })
                    });
                    renderQuizzesTable();
                }
            });

            actionCol.appendChild(deleteBtn);
            tr.appendChild(actionCol);
            quizTbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error loading quizzes:", error);
    }
}

// Init
renderQuizzesTable();
