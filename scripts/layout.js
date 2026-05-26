const basePath = window.location.hostname.includes("github.io")
    ? "/decla"
    : "";

// Navbar
fetch(`${basePath}/navbar.html`)
    .then(r => r.text())
    .then(html => {
        const cont = document.getElementById("navbar-container");

        if (cont) {
            cont.innerHTML = html;
        }
    })
    .catch(err => console.error("Error cargando navbar:", err));

// Footer
fetch(`${basePath}/footer.html`)
    .then(r => r.text())
    .then(html => {
        const cont = document.getElementById("footer-container");

        if (cont) {
            cont.innerHTML = html;
        }
    })
    .catch(err => console.error("Error cargando footer:", err));