const logoutBtn = document.getElementById("logoutBtn");
console.log(sessionStorage.getItem("instructorId"));
logoutBtn.addEventListener("click", function () 
{

sessionStorage.removeItem("instructorId");
location.href = "login.html";
})

