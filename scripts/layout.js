document.addEventListener("DOMContentLoaded", () => {
    // Cargar la navbar
    fetch("/navbar.html")
        .then(res => res.text())
        .then(html => {
            const container = document.getElementById("navbar-container");
            if (container) container.innerHTML = html;
        })
        .catch(err => console.error("Error cargando navbar:", err));

    // Cargar el footer
    fetch("/footer.html")
        .then(res => res.text())
        .then(html => {
            const container = document.getElementById("footer-container");
            if (container) container.innerHTML = html;
        })
        .catch(err => console.error("Error cargando footer:", err));
});
