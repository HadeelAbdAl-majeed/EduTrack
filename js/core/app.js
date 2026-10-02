
const addAssignmentButton=document.getElementById("addAssignment");


let db = "http://localhost:3000/instructors";

// Get the Instructors Data
async function getData(id) {
  try {
    const response = await fetch(`${db}/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Add Assignment Button
addAssignmentButton.addEventListener("click", async (event) => {
  event.preventDefault(); 

  try {
    const idInstructor = "inst_01";


    const instructorData = await getData(idInstructor);

    if (!instructorData || !instructorData.students) {
      throw new Error("Invalid instructor data");
    }

    const student = instructorData.students.find(
      (student) => student.id === "stu_001"
    );

    if (!student) {
      throw new Error("Student not found");
    }


    if (!student.assignments) {
      student.assignments = [];
    }

    
    student.assignments.push({
      id: "as_" + Date.now(),
      name: "ES5 Fundamentals",
      score: 50,
    });

    const updateResponseAssignments = await fetch(`${db}/${idInstructor}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ students: instructorData.students }),
    });

    if (!updateResponseAssignments.ok) {
      throw new Error("Failed to update instructor");
    }

    const updateDataAssignments = await updateResponseAssignments.json();
    console.log("Assignment added successfully!", updateDataAssignments);

  } catch (error) {
    console.error("Error adding assignment:", error.message);
  }
});




