// login section
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
if (loginForm)
{
const loginEmail = document.getElementById("loginEmail")
const loginPassword = document.getElementById("loginPassword")
const loginError = document.getElementById("loginError");


loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const getLoginEmail = loginEmail.value;
    const getLoginPassword = loginPassword.value;
    const response = await fetch("http://localhost:3000/instructors")
    const data = await response.json();
    const instructor = data.find(instructor => instructor.email === getLoginEmail && instructor.password === getLoginPassword);
    if (instructor) {
       sessionStorage.setItem("instructorId", instructor.id);
       console.log("Login successful");
    
    } else {
        loginError.textContent = "Invalid email or password";
        console.log("Login failed");
        return;
    }
})
}

//end of login section

// signup section
if(signupForm)
{

const firstName= document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const confirmPassword = document.getElementById("confirmPassword");
const signupError = document.getElementById("signupError");

signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const getFirstName = firstName.value;
    const getLastName = lastName.value;
    const getEmail = signupEmail.value;
    const getPassword = signupPassword.value;
    const getConfirmPassword = confirmPassword.value;
    const response= await fetch("http://localhost:3000/instructors")
    const getData= await response.json();
    
    const emailIsFound=getData.find(instructor => instructor.email === getEmail);
    if (emailIsFound)
    {
        signupError.textContent ="email is invalid ";
        return;
    }


if(getPassword=="")
{signupError.textContent="password is empty"
    return;
}
if(getPassword!=getConfirmPassword)
{signupError.textContent="password is not a same confirm" 
    return;
}
if(getFirstName=="")
{signupError.textContent="First name  is empty"
    return;
}
if(getLastName=="")
{signupError.textContent="Last name  is empty"
    return;
}
if(getEmail=="")
{signupError.textContent="email is empty"
    return;
}


const addNewId= await fetch("http://localhost:3000/instructors"
,{  method:"POST",
    headers: {
    "Content-Type": "application/json"},
    body: JSON.stringify({
    firstName: getFirstName,
    lastName: getLastName,
    email: getEmail,
    password: getPassword
})

    })
})
    
}