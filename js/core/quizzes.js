const db = "http://localhost:3000/instructors";
const instructorId = "inst_01";

// ================================
// DOM ELEMENTS
// ================================

const toggleBtn = document.getElementById("toggle-quiz-form-btn");
const cancelBtn = document.getElementById("cancel-quiz-btn");
const formContainer = document.getElementById("quiz-form-container");
const quizForm = document.getElementById("quiz-form");

const quizTitleInput = document.getElementById("quiz-title-input");
const editingQuizId = document.getElementById("editing-quiz-id");

const questionsContainer = document.getElementById("questions-container");
const addQuestionBtn = document.getElementById("add-question-btn");

const quizTbody = document.getElementById("quiz-tbody");


// ================================
// VARIABLES
// ================================

let questionCounter = 0;


// ================================
// SVG ICONS
// ================================

const editIcon = `
<svg 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    viewBox="0 0 24 24"
>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"></path>
</svg>
`;

const deleteIcon = `
<svg 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    viewBox="0 0 24 24"
>
    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7"></path>
    <path d="M10 11v6"></path>
    <path d="M14 11v6"></path>
    <path d="M5 7h14"></path>
    <path d="M10 4h4"></path>
    <path d="M9 4V3a1 1 0 011-1h4a1 1 0 011 1v1"></path>
</svg>
`;


// ================================
// OPEN CREATE FORM
// ================================

toggleBtn.addEventListener("click", () => {
    openCreateForm();
});


function openCreateForm() {

    formContainer.classList.remove("hidden");

    // Reset form
    quizForm.reset();

    // Clear editing ID
    editingQuizId.value = "";

    // Reset counter
    questionCounter = 0;

    // Clear old questions
    questionsContainer.innerHTML = "";

    // Add first question
    addQuestionBlock();

    // Change button text
    const submitBtn = quizForm.querySelector('button[type="submit"]');

    if (submitBtn) {
        submitBtn.textContent = "Save Quiz";
    }
}


// ================================
// CLOSE FORM
// ================================

cancelBtn.addEventListener("click", () => {
    closeForm();
});


function closeForm() {

    formContainer.classList.add("hidden");

    quizForm.reset();

    editingQuizId.value = "";

    questionsContainer.innerHTML = "";

    questionCounter = 0;
}


// ================================
// ADD QUESTION BUTTON
// ================================

addQuestionBtn.addEventListener("click", () => {
    addQuestionBlock();
});


// ================================
// ADD QUESTION BLOCK
// ================================

function addQuestionBlock(questionData = null) {

    questionCounter++;

    const qIndex = questionCounter;

    const block = document.createElement("div");

    block.className = "question-block";

    /*
        If we are editing an old question,
        use its old ID.
    */

    const questionId =
        questionData?.id ||
        `q_${Date.now()}_${qIndex}`;


    const questionText =
        questionData?.text || "";


    const options =
        questionData?.options || ["", "", ""];


    const correctOptionIndex =
        questionData?.correctOptionIndex ?? null;


    block.dataset.questionId = questionId;


    block.innerHTML = `

        <div class="question-header">

            <div class="question-number">
                Question ${qIndex}
            </div>

        </div>


        <div class="input-group">

            <label>
                Question
            </label>

            <input
                type="text"
                class="q-text"
                placeholder="Enter question text..."
                value="${escapeHtml(questionText)}"
                required
            >

        </div>


        <div class="options-container">

            <label>
                Options
                <span>(Select the correct answer)</span>
            </label>


            <div class="option-row">

                <input
                    type="radio"
                    name="correct_${qIndex}"
                    value="0"
                    ${correctOptionIndex === 0 ? "checked" : ""}
                    required
                >

                <input
                    type="text"
                    class="opt-text"
                    placeholder="Option 1"
                    value="${escapeHtml(options[0] || "")}"
                    required
                >

            </div>


            <div class="option-row">

                <input
                    type="radio"
                    name="correct_${qIndex}"
                    value="1"
                    ${correctOptionIndex === 1 ? "checked" : ""}
                >

                <input
                    type="text"
                    class="opt-text"
                    placeholder="Option 2"
                    value="${escapeHtml(options[1] || "")}"
                    required
                >

            </div>


            <div class="option-row">

                <input
                    type="radio"
                    name="correct_${qIndex}"
                    value="2"
                    ${correctOptionIndex === 2 ? "checked" : ""}
                >

                <input
                    type="text"
                    class="opt-text"
                    placeholder="Option 3"
                    value="${escapeHtml(options[2] || "")}"
                    required
                >

            </div>

        </div>
    `;


    questionsContainer.appendChild(block);
}


// ================================
// ESCAPE HTML
// ================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ================================
// SAVE / UPDATE QUIZ
// ================================

quizForm.addEventListener("submit", async (e) => {

    e.preventDefault();


    const title =
        quizTitleInput.value.trim();


    if (!title) {

        alert("Please enter a quiz title.");

        return;
    }


    // ============================
    // GET ALL QUESTIONS
    // ============================

    const questionsArray = [];

    const questionBlocks =
        document.querySelectorAll(".question-block");


    if (questionBlocks.length === 0) {

        alert("Please add at least one question.");

        return;
    }


    questionBlocks.forEach((block, index) => {

        const textInput =
            block.querySelector(".q-text");


        const text =
            textInput.value.trim();


        const optionsInputs =
            block.querySelectorAll(".opt-text");


        const options =
            Array.from(optionsInputs).map(input =>
                input.value.trim()
            );


        // ============================
        // GET SELECTED RADIO
        // ============================

        const selectedRadio =
            block.querySelector(
                'input[type="radio"]:checked'
            );


        const correctOptionIndex =
            selectedRadio
                ? Number(selectedRadio.value)
                : null;


        // Debug
        console.log(
            `Question ${index + 1}:`,
            correctOptionIndex
        );


        // ============================
        // VALIDATION
        // ============================

        if (!text) {

            alert(
                `Please enter question ${index + 1}.`
            );

            return;
        }


        if (
            options.length !== 3 ||
            options.some(option => !option)
        ) {

            alert(
                `Please fill all options for question ${index + 1}.`
            );

            return;
        }


        if (correctOptionIndex === null) {

            alert(
                `Please select the correct answer for question ${index + 1}.`
            );

            return;
        }


        // ============================
        // QUESTION OBJECT
        // ============================

        questionsArray.push({

            id:
                block.dataset.questionId ||
                `q_${Date.now()}_${index}`,

            text: text,

            options: options,

            correctOptionIndex:
                correctOptionIndex

        });

    });


    // Stop if validation failed
    if (questionsArray.length !== questionBlocks.length) {

        return;
    }


    // ============================
    // QUIZ OBJECT
    // ============================

    const editingId =
        editingQuizId.value;


    const newQuizData = {

        id:
            editingId ||
            `quiz_${Date.now()}`,

        title: title,

        questions: questionsArray

    };


    try {

        // ============================
        // SHOW LOADING
        // ============================

        const submitBtn =
            quizForm.querySelector(
                'button[type="submit"]'
            );


        if (submitBtn) {

            submitBtn.disabled = true;

            submitBtn.textContent =
                "Saving...";
        }


        // ============================
        // GET INSTRUCTOR
        // ============================

        const response =
            await fetch(
                `${db}/${instructorId}`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to fetch instructor data."
            );
        }


        const instructorData =
            await response.json();


        // ============================
        // MAKE SURE QUIZZES EXISTS
        // ============================

        if (!Array.isArray(instructorData.quizzes)) {

            instructorData.quizzes = [];
        }


        // ============================
        // UPDATE EXISTING QUIZ
        // ============================

        if (editingId) {

            const quizIndex =
                instructorData.quizzes.findIndex(
                    quiz => quiz.id === editingId
                );


            if (quizIndex === -1) {

                throw new Error(
                    "Quiz not found."
                );
            }


            instructorData.quizzes[quizIndex] =
                newQuizData;

        }

        // ============================
        // CREATE NEW QUIZ
        // ============================

        else {

            instructorData.quizzes.push(
                newQuizData
            );
        }


        // ============================
        // PATCH DATABASE
        // ============================

        const updateResponse =
            await fetch(
                `${db}/${instructorId}`,
                {

                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        quizzes:
                            instructorData.quizzes

                    })

                }
            );


        if (!updateResponse.ok) {

            throw new Error(
                "Failed to save quiz."
            );
        }


        // ============================
        // CLOSE FORM
        // ============================

        closeForm();


        // ============================
        // REFRESH TABLE
        // ============================

        await renderQuizzesTable();


    } catch (error) {

        console.error(
            "Error saving quiz:",
            error
        );


        alert(
            "Something went wrong while saving the quiz."
        );

    } finally {

        const submitBtn =
            quizForm.querySelector(
                'button[type="submit"]'
            );


        if (submitBtn) {

            submitBtn.disabled = false;

            submitBtn.textContent =
                "Save Quiz";
        }

    }

});


// ================================
// EDIT QUIZ
// ================================

async function editQuiz(quizId) {

    try {

        const response =
            await fetch(
                `${db}/${instructorId}`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load instructor."
            );
        }


        const instructorData =
            await response.json();


        const quizzes =
            instructorData.quizzes || [];


        const quiz =
            quizzes.find(
                item => item.id === quizId
            );


        if (!quiz) {

            alert("Quiz not found.");

            return;
        }


        // ============================
        // OPEN FORM
        // ============================

        formContainer.classList.remove(
            "hidden"
        );


        // ============================
        // SET EDITING ID
        // ============================

        editingQuizId.value =
            quiz.id;


        // ============================
        // SET TITLE
        // ============================

        quizTitleInput.value =
            quiz.title;


        // ============================
        // CLEAR QUESTIONS
        // ============================

        questionsContainer.innerHTML = "";


        questionCounter = 0;


        // ============================
        // ADD OLD QUESTIONS
        // ============================

        if (
            Array.isArray(quiz.questions) &&
            quiz.questions.length > 0
        ) {

            quiz.questions.forEach(question => {

                addQuestionBlock(question);

            });

        }

        else {

            addQuestionBlock();

        }


        // ============================
        // CHANGE BUTTON TEXT
        // ============================

        const submitBtn =
            quizForm.querySelector(
                'button[type="submit"]'
            );


        if (submitBtn) {

            submitBtn.textContent =
                "Update Quiz";
        }


        // Scroll to form
        formContainer.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    } catch (error) {

        console.error(
            "Error editing quiz:",
            error
        );


        alert(
            "Something went wrong while opening the quiz."
        );

    }

}


// ================================
// DELETE QUIZ
// ================================

async function deleteQuiz(quizId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this quiz?"
        );


    if (!confirmed) {

        return;
    }


    try {

        // ============================
        // GET INSTRUCTOR
        // ============================

        const response =
            await fetch(
                `${db}/${instructorId}`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load instructor."
            );
        }


        const instructorData =
            await response.json();


        const quizzes =
            instructorData.quizzes || [];


        // ============================
        // REMOVE QUIZ
        // ============================

        const filteredQuizzes =
            quizzes.filter(
                quiz => quiz.id !== quizId
            );


        // Check if quiz existed
        if (
            filteredQuizzes.length ===
            quizzes.length
        ) {

            alert("Quiz not found.");

            return;
        }


        // ============================
        // UPDATE DATABASE
        // ============================

        const updateResponse =
            await fetch(
                `${db}/${instructorId}`,
                {

                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        quizzes:
                            filteredQuizzes

                    })

                }
            );


        if (!updateResponse.ok) {

            throw new Error(
                "Failed to delete quiz."
            );
        }


        // ============================
        // REFRESH TABLE
        // ============================

        await renderQuizzesTable();


    } catch (error) {

        console.error(
            "Error deleting quiz:",
            error
        );


        alert(
            "Something went wrong while deleting the quiz."
        );

    }

}


// ================================
// RENDER QUIZZES TABLE
// ================================

async function renderQuizzesTable() {

    try {

        // ============================
        // LOADING STATE
        // ============================

        quizTbody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="loading-state"
                >
                    Loading quizzes...
                </td>

            </tr>

        `;


        // ============================
        // FETCH DATA
        // ============================

        const response =
            await fetch(
                `${db}/${instructorId}`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load quizzes."
            );
        }


        const data =
            await response.json();


        const quizzes =
            Array.isArray(data.quizzes)
                ? data.quizzes
                : [];


        // ============================
        // EMPTY STATE
        // ============================

        if (quizzes.length === 0) {

            quizTbody.innerHTML = `

                <tr>

                    <td
                        colspan="4"
                        class="empty-state"
                    >
                        No quizzes found.
                        <br>
                        Create your first quiz.
                    </td>

                </tr>

            `;

            return;
        }


        // ============================
        // CLEAR TABLE
        // ============================

        quizTbody.innerHTML = "";


        // ============================
        // CREATE ROWS
        // ============================

        quizzes.forEach((quiz, index) => {

            const tr =
                document.createElement("tr");


            const numberTd =
                document.createElement("td");


            numberTd.textContent =
                index + 1;


            const titleTd =
                document.createElement("td");


            titleTd.textContent =
                quiz.title || "Untitled Quiz";


            const questionsTd =
                document.createElement("td");


            questionsTd.textContent =
                Array.isArray(quiz.questions)
                    ? quiz.questions.length
                    : 0;


            // ============================
            // ACTIONS
            // ============================

            const actionTd =
                document.createElement("td");


            actionTd.className =
                "actions-cell";


            // EDIT BUTTON
            const editBtn =
                document.createElement("button");


            editBtn.type =
                "button";


            editBtn.className =
                "btn-icon btn-edit";


            editBtn.innerHTML =
                editIcon;


            editBtn.title =
                "Edit Quiz";


            editBtn.addEventListener(
                "click",
                () => editQuiz(quiz.id)
            );


            // DELETE BUTTON
            const deleteBtn =
                document.createElement("button");


            deleteBtn.type =
                "button";


            deleteBtn.className =
                "btn-icon btn-delete";


            deleteBtn.innerHTML =
                deleteIcon;


            deleteBtn.title =
                "Delete Quiz";


            deleteBtn.addEventListener(
                "click",
                () => deleteQuiz(quiz.id)
            );


            // Add buttons
            actionTd.appendChild(editBtn);

            actionTd.appendChild(deleteBtn);


            // Add cells
            tr.appendChild(numberTd);

            tr.appendChild(titleTd);

            tr.appendChild(questionsTd);

            tr.appendChild(actionTd);


            // Add row
            quizTbody.appendChild(tr);

        });


    } catch (error) {

        console.error(
            "Error loading quizzes:",
            error
        );


        quizTbody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="error-state"
                >
                    Failed to load quizzes.
                    Please make sure JSON Server is running.
                </td>

            </tr>

        `;

    }

}


// ================================
// INITIAL LOAD
// ================================

renderQuizzesTable();