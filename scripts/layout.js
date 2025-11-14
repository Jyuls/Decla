// Cargar navbar
fetch('/navbar.html')
    .then(r => r.text())
    .then(html => {
        const cont = document.getElementById('navbar-container');
        if (cont) cont.innerHTML = html;
    })
    .catch(err => console.error("Error cargando navbar:", err));

// Cargar footer
fetch('/footer.html')
    .then(r => r.text())
    .then(html => {
        const cont = document.getElementById('footer-container');
        if (cont) cont.innerHTML = html;
    })
    .catch(err => console.error("Error cargando footer:", err));
