const assignmentsList = document.getElementById("assignmentsList");

const openAddPopup = document.getElementById("openAddPopup");
const addPopup = document.getElementById("addPopup");

const assignmentName = document.getElementById("assignmentName");
const assignmentScore = document.getElementById("assignmentScore");

const addAssignmentButton = document.getElementById("addAssignment");
const cancelAdd = document.getElementById("cancelAdd");
const closeAddPopup = document.getElementById("closeAddPopup");

const editPopup = document.getElementById("editPopup");

const editAssignmentName = document.getElementById("editAssignmentName");
const editAssignmentScore = document.getElementById("editAssignmentScore");

const saveEdit = document.getElementById("saveEdit");
const cancelEdit = document.getElementById("cancelEdit");
const closeEditPopup = document.getElementById("closeEditPopup");

const searchInput = document.getElementById("searchInput");
const assignmentCount = document.getElementById("assignmentCount");

const db = "http://localhost:3000/instructors";

const instructorId = "inst_01";
const studentId = "stu_001";

let currentAssignmentId = null;


async function getData() {

    const response = await fetch(`${db}/${instructorId}`);

    const data = await response.json();

    return data;

}


async function displayAssignments(searchValue = "") {

    const data = await getData();

    const student = data.students.find(
        (student) => student.id === studentId
    );

    assignmentsList.innerHTML = "";


    const filteredAssignments = student.assignments.filter(
        (assignment) =>
            assignment.name
                .toLowerCase()
                .includes(searchValue.toLowerCase())
    );


    filteredAssignments.forEach((assignment, index) => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>

            <td>${assignment.name}</td>

            <td>${assignment.score}</td>

            <td>
                <div class="actions">

                    <button
                        class="editButton"
                        title="Edit Assignment"
                    >
                        ✎
                    </button>

                    <button
                        class="deleteButton"
                        title="Delete Assignment"
                    >
                        🗑
                    </button>

                </div>
            </td>
        `;


        const editButton = row.querySelector(".editButton");

        editButton.addEventListener("click", () => {

            editAssignment(assignment.id);

        });


        const deleteButton = row.querySelector(".deleteButton");

        deleteButton.addEventListener("click", () => {

            deleteAssignment(assignment.id);

        });


        assignmentsList.appendChild(row);

    });


    assignmentCount.innerText =
        `Showing ${filteredAssignments.length} assignments`;

}


openAddPopup.addEventListener("click", () => {

    assignmentName.value = "";

    assignmentScore.value = "";

    addPopup.style.display = "flex";

});


cancelAdd.addEventListener("click", () => {

    addPopup.style.display = "none";

});


closeAddPopup.addEventListener("click", () => {

    addPopup.style.display = "none";

});


addAssignmentButton.addEventListener("click", async () => {

    const name = assignmentName.value.trim();

    const score = Number(assignmentScore.value);


    if (name === "") {

        alert("Please enter assignment name");

        return;

    }


    const data = await getData();


    const student = data.students.find(
        (student) => student.id === studentId
    );


    const newAssignment = {

        id: "as_" + Date.now(),

        name: name,

        score: score

    };


    student.assignments.push(newAssignment);


    await fetch(`${db}/${instructorId}`, {

        method: "PATCH",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            students: data.students

        })

    });


    addPopup.style.display = "none";


    assignmentName.value = "";

    assignmentScore.value = "";


    displayAssignments(searchInput.value);

});


async function editAssignment(assignmentId) {

    const data = await getData();


    const student = data.students.find(
        (student) => student.id === studentId
    );


    const assignment = student.assignments.find(
        (assignment) => assignment.id === assignmentId
    );


    editAssignmentName.value = assignment.name;

    editAssignmentScore.value = assignment.score;


    currentAssignmentId = assignmentId;


    editPopup.style.display = "flex";

}


saveEdit.addEventListener("click", async () => {

    const name = editAssignmentName.value.trim();

    const score = Number(editAssignmentScore.value);


    if (name === "") {

        alert("Please enter assignment name");

        return;

    }


    const data = await getData();


    const student = data.students.find(
        (student) => student.id === studentId
    );


    const assignment = student.assignments.find(
        (assignment) => assignment.id === currentAssignmentId
    );


    assignment.name = name;

    assignment.score = score;


    await fetch(`${db}/${instructorId}`, {

        method: "PATCH",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            students: data.students

        })

    });


    editPopup.style.display = "none";

    currentAssignmentId = null;


    displayAssignments(searchInput.value);

});


cancelEdit.addEventListener("click", () => {

    editPopup.style.display = "none";

    currentAssignmentId = null;

});


closeEditPopup.addEventListener("click", () => {

    editPopup.style.display = "none";

    currentAssignmentId = null;

});


async function deleteAssignment(assignmentId) {

    const data = await getData();


    const student = data.students.find(
        (student) => student.id === studentId
    );


    const assignmentIndex = student.assignments.findIndex(
        (assignment) => assignment.id === assignmentId
    );


    if (assignmentIndex === -1) {

        return;

    }


    student.assignments.splice(assignmentIndex, 1);


    await fetch(`${db}/${instructorId}`, {

        method: "PATCH",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            students: data.students

        })

    });


    displayAssignments(searchInput.value);

}


searchInput.addEventListener("input", () => {

    displayAssignments(searchInput.value);

});


addPopup.addEventListener("click", (event) => {

    if (event.target === addPopup) {

        addPopup.style.display = "none";

    }

});


editPopup.addEventListener("click", (event) => {

    if (event.target === editPopup) {

        editPopup.style.display = "none";

        currentAssignmentId = null;

    }

});


displayAssignments();