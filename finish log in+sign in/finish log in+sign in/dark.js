const darkModeBtn = document.getElementById('darkModeBtn');
const logo = document.querySelector('.logo img');
if (darkModeBtn) {

darkModeBtn.addEventListener('click', function() {

    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
        darkModeBtn.textContent = '☀️';
        logo.src = 'photo/darkLogo.jpg';
        localStorage.setItem('darkMode', 'enabled');

    } else {
        darkModeBtn.textContent = '🌙';
        logo.src = 'photo/logo.jpg';
        localStorage.setItem('darkMode', 'disabled');
    }

});
}

if (localStorage.getItem('darkMode') === 'enabled') {
     document.body.classList.add('dark-mode');
    if (darkModeBtn) {
    darkModeBtn.textContent = '☀️';
    }
    if (logo) {
    logo.src = 'photo/darkLogo.jpg';
    }
}