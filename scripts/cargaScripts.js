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
            window.location.href = "tabla.html";

        } catch (error) {
            alert("Ocurrió un error al procesar los archivos PDF");
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

        const fileData = await leerArchivoComoArrayBuffer(file);

        const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(fileData),
            cMapUrl: "/scripts/pdfjs/cmaps/",
            cMapPacked: true
        });

        const pdf = await loadingTask.promise;

        const page = await pdf.getPage(1);
        const textContent = await page.getTextContent();

        let pageText = textContent.items.map(item => item.str || "").join(" ");

        localStorage.setItem(`document${i}`, pageText.trim());
    }
}


// ============================
// Helper para leer archivo
// ============================

function leerArchivoComoArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e.target.error);

        reader.readAsArrayBuffer(file);
    });
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
