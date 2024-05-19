async function handleFileUpload(files) {
    if (files.length > 0) {
        localStorage.clear();
        showLoader(); // Mostrar el loader y aplicar efecto de tono gris al contenido

        try {
            // Procesar y guardar archivos en el Local Storage
            await procesarArchivos(files);
            // Redireccionar a tabla.html después de procesar todos los archivos
            window.location.href = "tabla.html";
        } catch (error) {
            alert("Solo es válido subir archivos PDF", error);
        } finally {
            hideLoader(); // Ocultar el loader y quitar efecto de tono gris
            document.getElementById("main-content").classList.remove("gray-out");
        }
    }
}

async function procesarArchivos(files) {
    // Iterar sobre cada archivo seleccionado
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Crear un lector de archivos
        const reader = new FileReader();
        
        // Función que se ejecuta cuando se carga el archivo
        const fileData = await new Promise((resolve, reject) => {
            reader.onload = function(event) {
                resolve(event.target.result);
            };
            reader.onerror = function(event) {
                reject(event.target.error);
            };
            reader.readAsArrayBuffer(file);
        });
        
        // Inicializar el visor de PDF.js
        const loadingTask = pdfjsLib.getDocument(new Uint8Array(fileData));
        
        // Cargar el PDF
        const pdf = await loadingTask.promise;
        
        // Obtener el contenido de la única página del PDF
        const page = await pdf.getPage(1);
        const textContent = await page.getTextContent();
        
        // Extraer el texto de la página
        let pageText = '';
        textContent.items.forEach(function (textItem) {
            pageText += textItem.str + ' ';
        });
        
        // Guardar el nombre del archivo y su contenido en el Local Storage
        localStorage.setItem(`document${i}`, pageText);
    }
}

function showLoader() {
    document.getElementById("loader").style.display = "block";
}

function hideLoader() {
    document.getElementById("loader").style.display = "none";
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    handleFileUpload(files);
}