document.getElementById("goBack").addEventListener("click", function() {
    window.location.href = "index.html";
});

// Función para extraer datos del documento PDF
function extractDataFromPDF(text) {
    const data = {};
    data["Fecha de pago"] = extractFechaPago(text);
    data["Periodo de pago"] = extractPeriodoPago(text);
    data["Percepciones"] = extractPercepciones(text);
    data["ISR"] = extractISR(text);
    data["Quincena Neta"] = calculateQuincenaNeta(data["Percepciones"], data["ISR"]);
    return data;
}

// Función para extraer fecha de pago del texto del PDF
function extractFechaPago(text) {
    const regex = /\b\d{2}\/\d{2}\/\d{4}\b/g;
    const matches = text.match(regex);
    
    if (matches && matches.length >= 2) {
        return matches[1].trim();
    }
    return "";
}

// Función para extraer periodo de pago del texto del PDF
function extractPeriodoPago(text) {
    const regex = /\b\d{2}\/\d{2}\/\d{4}\b/g;
    const matches = text.match(regex);
    if (matches && matches.length >= 2) {
        return matches[0].trim() + " - " + matches[2].trim();
    }
    return "";
}

// Función para extraer percepciones del texto del PDF
function extractPercepciones(text) {
    const regex = /\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b/g;
    const match = text.match(regex);
    if (match && match[0]) {
        return match[5];
    }
    return "";
}

// Función para extraer ISR del texto del PDF
function extractISR(text) {
    const regex = /IMPUESTO SOBRE LA RENTA\s+(\d{1,3}(?:,\d{3})*(?:\.\d{1,2}))/;
    const match = text.match(regex);
    if (match && match[1]) {
        return match[1];
    }
    return "0";
}

// Función para calcular la quincena neta
function calculateQuincenaNeta(percepciones, isr) {
    const percepcionesValue = parseFloat(percepciones.replace(/,/g, ""));
    const isrValue = parseFloat(isr.replace(/,/g, ""));
    return (percepcionesValue - isrValue).toFixed(2);
}

// Función para insertar datos en la tabla
function insertDataIntoTable(data, rowNum) {
    const tableBody = document.getElementById("tablaDatos");

    const newRow = tableBody.insertRow();
    newRow.insertCell().textContent = rowNum;
    newRow.insertCell().textContent = data["Fecha de pago"];
    newRow.insertCell().textContent = data["Periodo de pago"];
    newRow.insertCell().textContent = data["Percepciones"];
    newRow.insertCell().textContent = data["ISR"];
    newRow.insertCell().textContent = data["Quincena Neta"];
}

function ordenarPorFechaDePago(datos) {
    // Copiar el array de datos para no modificar el original
    const datosOrdenados = [...datos];
    // Ordenar los datos por fecha de pago
    datosOrdenados.sort((a, b) => {
        const fechaA = new Date(a["Fecha de pago"]);
        const fechaB = new Date(b["Fecha de pago"]);
        return fechaA - fechaB;
    });
    return datosOrdenados;
}

function convertirFormatoFecha(datos) {
    // Convertir el formato de la fecha de pago de cada objeto en datos
    datos.forEach(data => {
        const fechaPagoParts = data["Fecha de pago"].split("/");
        // Crear una nueva fecha con el formato "mm/dd/yyyy" para evitar perder un día
        const fechaPagoFormatted = new Date(`${fechaPagoParts[1]}/${fechaPagoParts[0]}/${fechaPagoParts[2]}`);
        data["Fecha de pago"] = fechaPagoFormatted; // Convertimos temporalmente a formato de fecha
    });
}

function revertirFormatoFecha(datos) {
    // Revertir el formato de la fecha de pago a "dd/mm/yyyy"
    datos.forEach(data => {
        const fechaPago = data["Fecha de pago"];
        const fechaPagoFormatted = `${fechaPago.getDate()}/${fechaPago.getMonth() + 1}/${fechaPago.getFullYear()}`;
        data["Fecha de pago"] = fechaPagoFormatted; // Volvemos al formato original
    });
}

function ordenarPorFechaCronologica(datos) {
    // Ordenar los datos por fecha de pago de forma cronológica
    datos.sort((a, b) => a["Fecha de pago"] - b["Fecha de pago"]);
}

// Función para generar el PDF
function generarPDF() {
    var tablaDatos = document.getElementById('tablaDatos');
    var tablaData = [];
    
    // Agregar encabezados
    var headerRow = [];
    
    for (var i = 0; i < tablaDatos.rows[0].cells.length; i++) {
        headerRow.push({ text: tablaDatos.rows[0].cells[i].textContent, style: 'tableHeader' });
    }
    tablaData.push(headerRow);

    // Agregar datos
    for (var i = 1; i < tablaDatos.rows.length; i++) {
        var rowData = [];
        for (var j = 0; j < tablaDatos.rows[i].cells.length; j++) {
            rowData.push(tablaDatos.rows[i].cells[j].textContent);
        }
        tablaData.push(rowData);
    }

    // Crear el documento
    var docDefinition = {
        content: [
            {
                table: {
                    headerRows: 1,
                    body: tablaData
                }
            }
        ],
        styles: {
            tableHeader: {
                bold: true,
                fontSize: 12,
                color: "black",
                fillColor: "#CCCCCC",
            }
        }
    };

    // Generar el PDF
    pdfMake.createPdf(docDefinition).open();
}

// Llamar a la función generarPDF cuando se haga clic en el botón "Generar PDF"
document.getElementById("exportPDF").addEventListener("click", function() {
    generarPDF();
});

function agregarFooterTabla(totalQuincenaNeta) {
    const table = document.getElementById("tablaDatos");
    const tfoot = document.createElement("tfoot");
    const totalRow = document.createElement("tr");

    // Obtener el número total de columnas en la tabla
    const numColumnas = table.rows[0].cells.length;

    // Crear celdas vacías para las columnas antes del total
    for (let i = 0; i < numColumnas - 1; i++) {
        totalRow.appendChild(document.createElement("td"));
    }

    // Crear la celda para el total y agregarlo como última celda de la fila
    const totalQuincenaCell = document.createElement("td");
    totalQuincenaCell.textContent = "$" + totalQuincenaNeta.toFixed(2);
    totalRow.appendChild(totalQuincenaCell);

    // Agregar la fila al tfoot y el tfoot a la tabla
    tfoot.appendChild(totalRow);
    table.appendChild(tfoot);
}

// Evento para llenar la tabla al cargar la página
document.addEventListener("DOMContentLoaded", function() {
    // Crear un array para almacenar los datos
    const datos = [];
    // Iterar sobre las claves del localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Verificar si la clave corresponde a un documento PDF

        if (key.startsWith("document")) {
            // Leer el contenido del documento PDF del localStorage
            const pdfContent = localStorage.getItem(key);
            // Verificar si se encontró el contenido del PDF
            if (pdfContent) {
                // Extraer los datos del PDF
                const pdfData = extractDataFromPDF(pdfContent);
                // Agregar los datos al array
                datos.push(pdfData);
            }
        }
    }
    // Convertir formato de fecha
    convertirFormatoFecha(datos);

    // Ordenar por fecha de pago de forma cronológica
    ordenarPorFechaCronologica(datos);

    // Revertir formato de fecha
    revertirFormatoFecha(datos);

    // Insertar los datos en la tabla
    const tableBody = document.querySelector("tablaDatos"); // Cambiado el selector para que coincida con el tbody
    let rowNum = 1; // Contador para el número de fila

    datos.forEach(data => {
        insertDataIntoTable(data, rowNum); // Llamar a insertDataIntoTable con el número de fila actual
        rowNum++; // Incrementar el contador de número de fila
    });

    // Calcular y mostrar el total de quincena neta
    const totalQuincenaNeta = datos.reduce((total, data) => total + parseFloat(data["Quincena Neta"]), 0);
    
    // Agregar Footer
    agregarFooterTabla(totalQuincenaNeta);
});

// Función para generar un archivo de Excel
function exportToExcel() {
    var table = document.getElementById('tablaDatos');
    var tableData = [];

    // Agregar datos
    for (var i = 0; i < table.rows.length; i++) {
        var rowData = [];
        for (var j = 0; j < table.rows[i].cells.length; j++) {
            rowData.push(table.rows[i].cells[j].textContent);
        }
        tableData.push(rowData);
    }

    // Crear una nueva hoja de cálculo
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(tableData);

    // Ajustar el ancho de las columnas y el alto de las filas
    var wscols = [
        { wch: 5 }, // Ancho de la primera columna
        { wch: 15 }, // Ancho de la segunda columna
        { wch: 25 }, // Ancho de la tercera columna
        { wch: 15 }, // Ancho de la cuarta columna
        { wch: 10 },  // Ancho de la quinta columna
        { wch: 15 }  // Ancho de la sexta columna
    ];

    var wsrows = tableData.map(function() {
        return { hpt: 15 }; // Establecer la altura de las filas en puntos
    });

    // Agregar las configuraciones de columnas y filas al objeto de hoja de cálculo
    ws['!cols'] = wscols;
    ws['!rows'] = wsrows;

    // Agregar la hoja de cálculo al libro de trabajo
    XLSX.utils.book_append_sheet(wb, ws, "DeclaracionPatrimonial");

    // Generar un archivo de Excel
    var wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // Guardar el archivo
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "DeclaracionPatrimonial.xlsx");
}

// Agregar evento de clic al botón de exportar a Excel
document.getElementById("exportExcel").addEventListener("click", function() {
    exportToExcel();
});