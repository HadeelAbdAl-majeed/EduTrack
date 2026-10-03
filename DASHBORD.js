const logoutBtn = document.getElementById("logoutBtn");
const menuBtn=document.getElementById("menuBtn");
const sidebar=document.getElementById("sidebar");
const profileBtn=document.getElementById("profileBtn");
const profileMenu=document.getElementById("profileMenu");
console.log(sessionStorage.getItem("instructorId"));
logoutBtn.addEventListener("click", function () 
{

sessionStorage.removeItem("instructorId");
location.href = "login.html";
})

menuBtn.addEventListener("click", function ()
{
sidebar.classList.toggle("open");



})

profileBtn.addEventListener("click", function ()
{


profileMenu.classList.toggle("open");


})

document.addEventListener("click", function (event) {
    if(!profileBtn.contains(event.target)&&!profileMenu.contains(event.target))
        {profileMenu.classList.remove("open");}

    if(!menuBtn.contains(event.target)&&!sidebar.contains(event.target))
    {sidebar.classList.remove("open")}

})

