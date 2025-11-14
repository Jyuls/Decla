// ============================
// Inicialización de eventos
// ============================

document.addEventListener("DOMContentLoaded", () => {
    const uploadArea = document.getElementById("upload-area");
    const uploadInput = document.getElementById("upload-input");

    if (uploadArea) {
        uploadArea.addEventListener("dragover", handleDragOver);
        uploadArea.addEventListener("drop", handleDrop);
        uploadArea.addEventListener("click", () => uploadInput.click());
    }

    if (uploadInput) {
        uploadInput.addEventListener("change", () => handleFileUpload(uploadInput.files));
    }
});


// ============================
// Función principal de carga
// ============================

async function handleFileUpload(files) {
    if (files.length > 0) {
        localStorage.clear();
        showLoader();

        try {
            await procesarArchivos(files);

            // Redirigir cuando ya terminó todo
            window.location.href = "tabla.html";

        } catch (error) {
            alert("Solo es válido subir archivos PDF");
            console.error(error);
        } finally {
            hideLoader();
        }
    }
}


// ============================
// Procesamiento de archivos PDF
// ============================

async function procesarArchivos(files) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.name.toLowerCase().endsWith(".pdf")) {
            throw new Error("Archivo no PDF detectado");
        }

        const reader = new FileReader();

        const fileData = await new Promise((resolve, reject) => {
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(e.target.error);
            reader.readAsArrayBuffer(file);
        });

        // PDF.js
        const loadingTask = pdfjsLib.getDocument(new Uint8Array(fileData));
        const pdf = await loadingTask.promise;

        const page = await pdf.getPage(1);
        const textContent = await page.getTextContent();

        // Extraer texto
        let pageText = "";
        for (let item of textContent.items) {
            pageText += (item.str || "") + " ";
        }

        // Guardar en LocalStorage
        localStorage.setItem(`document${i}`, pageText.trim());
    }
}


// ============================
// Loader
// ============================

function showLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "flex";
}

function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "none";
}


// ============================
// Drag & Drop
// ============================

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    handleFileUpload(files);
}
