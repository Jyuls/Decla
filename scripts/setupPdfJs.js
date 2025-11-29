import * as pdfjsLib from "/scripts/pdfjs/pdf.mjs";

// Configurar worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "/scripts/pdfjs/pdf.worker.mjs";

// Exponer para uso global por otros scripts
window.pdfjsLib = pdfjsLib;
