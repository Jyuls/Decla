// Función para extraer datos del documento PDF
function extractDataFromPDF(text) {
    const data = {};
    data["Fecha de pago"] = extractFechaPago(text);
    data["Periodo de pago"] = extractPeriodoPago(text);
    data["Percepciones"] = extractPercepciones(text);
    data["ISR"] = extractISR(text);
    data["Prestaciones"] = extractPrestaciones(text);
    return data;
}

// Función para extraer prestaciones del texto del PDF
function extractPrestaciones(text) {
    const prestaciones = [
        "COMPENSACIÓN NACIONAL ÚNICA",
        "BONO AJUSTE CALENDARIO",
        "PRIMA VACACIONAL",
        "ESTIMULO AL DOCENTE",
        "BONO DE VERANO",
        "INICIO DE CICLO ESCOLAR",
        "ESTIMULO AL DOCENTE",
        "BONO MAGISTERIAL",
        "BONO ANUAL SOCIAL",
    ];

    const valores = {};

    prestaciones.forEach(prestacion => {
        const regex = new RegExp(`${prestacion}\\s+([\\d,]+(?:\\.\\d{1,2})?)`, 'i');
        const match = text.match(regex);
        if (match) {
            const valorNumerico = parseFloat(match[1].replace(",", ""));
            valores[prestacion] = valorNumerico;
        } else {
            valores[prestacion] = 0;
        }
    });

    const totalPrestaciones = Object.values(valores).reduce((total, valor) => total + parseFloat(valor), 0);
    
    if (totalPrestaciones == 0) {
        return 0;
    } else {
        return totalPrestaciones.toLocaleString("es-MX", { minimumFractionDigits: 2 });
    }
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
    // El nuevo regex incluye un punto decimal obligatorio en los valores numéricos
    const regex = /\b\d{1,3}(?:,\d{3})*\.\d{2}\b/g;
    const match = text.match(regex);
    if (match && match.length > 0) {
        match.sort((a, b) => parseFloat(b.replace(/,/g, '')) - parseFloat(a.replace(/,/g, '')));
        return match[0]; // Ajusta el índice según la posición del valor correcto
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

document.addEventListener("DOMContentLoaded", function() {
    const datos = obtenerDatosDesdeLocalStorage();
    const percepcionesArray = obtenerPercepcionesArray(datos);
    
    convertirFormatoFecha(datos);
    ordenarPorFechaCronologica(datos);
    revertirFormatoFecha(datos);
    insertarDatosEnTabla(datos);

    const totalPrestaciones = calcularTotalPrestaciones(datos);
    const totalPercepciones = calcularTotalPercepciones(percepcionesArray);
    const totalISR = calcularTotalISR(datos);
    
    agregarFooterTabla(totalPercepciones, totalISR, totalPrestaciones);

    // Calcular y mostrar la remuneración anual neta con prestaciones
    const remuneracionConPrestaciones = Math.ceil(totalPercepciones - totalISR);

    // Calcular la remuneración anual neta sin prestaciones
    const remuneracionSinPrestaciones = Math.ceil(remuneracionConPrestaciones - parseFloat(totalPrestaciones.replace(/,/g, '')));

    // Mostrar la remuneración anual neta con prestaciones en la tabla
    document.getElementById("remuneracionConPrestaciones").textContent = remuneracionConPrestaciones.toLocaleString("es-MX");

    // Mostrar la remuneración anual neta sin prestaciones en la tabla
    document.getElementById("remuneracionSinPrestaciones").textContent = remuneracionSinPrestaciones.toLocaleString("es-MX");
});



// Función para insertar los datos en la tabla
function insertarDatosEnTabla(datos) {
    const tableBody = document.getElementById("tablaDatos");
    let rowNum = 1;

    datos.forEach(data => {
        insertDataIntoTable(data, rowNum);
        rowNum++;
    });
}

// Función para insertar datos en la tabla
function insertDataIntoTable(data, rowNum) {
    const tableBody = document.getElementById("tablaDatos");

    const newRow = tableBody.insertRow();
    newRow.insertCell().textContent = rowNum;
    newRow.insertCell().textContent = data["Fecha de pago"];
    newRow.insertCell().textContent = data["Periodo de pago"];
    newRow.insertCell().textContent = data["Percepciones"].toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    newRow.insertCell().textContent = data["ISR"].toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    newRow.insertCell().textContent = data["Prestaciones"] === 0 ? "0" : data["Prestaciones"].toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Función para agregar el footer a la tabla
function agregarFooterTabla(totalPercepciones, totalISR, totalPrestaciones) {
    const table = document.getElementById("tablaDatos");
    const tfoot = document.createElement("tfoot");
    const totalRow = document.createElement("tr");

    const numColumnas = table.rows[0].cells.length;

    for (let i = 0; i < numColumnas - 3; i++) {
        totalRow.appendChild(document.createElement("td"));
    }

    const totalPercepcionesCell = document.createElement("td");
    totalPercepcionesCell.textContent = totalPercepciones.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    totalRow.appendChild(totalPercepcionesCell);

    const totalISRCell = document.createElement("td");
    totalISRCell.textContent = totalISR.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    totalRow.appendChild(totalISRCell);

    const totalPrestacionesCell = document.createElement("td");
    totalPrestacionesCell.textContent = totalPrestaciones === 0 ? "0" : totalPrestaciones.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    totalRow.appendChild(totalPrestacionesCell);

    tfoot.appendChild(totalRow);
    table.appendChild(tfoot);
}

// Función para obtener los datos del LocalStorage
function obtenerDatosDesdeLocalStorage() {
    const datos = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("document")) {
            const pdfContent = localStorage.getItem(key);
            if (pdfContent) {
                const pdfData = extractDataFromPDF(pdfContent);
                datos.push(pdfData);
            }
        }
    }
    return datos;
}

// Función para obtener un array de percepciones
function obtenerPercepcionesArray(datos) {
    return datos.map(data => parseFloat(data["Percepciones"].replace(/,/g, "")));
}

// Función para calcular el total de percepciones
function calcularTotalPercepciones(percepcionesArray) {
    return percepcionesArray.reduce((total, percepcion) => total + percepcion, 0);
}

// Función para calcular el total del ISR
function calcularTotalISR(datos) {
    const totalISR = datos.reduce((total, data) => total + parseFloat(data["ISR"].replace(/,/g, '')), 0);
    return totalISR;
}


// Función para calcular el total de prestaciones
function calcularTotalPrestaciones(datos) {
    const totalPrestaciones = datos.reduce((total, data) => {
        const prestacionesString = typeof data["Prestaciones"] === 'string' ? data["Prestaciones"] : data["Prestaciones"].toString();
        const percepcionesSinComa = prestacionesString.replace(/,/g, "");
        return total + parseFloat(percepcionesSinComa);
    }, 0);
    return totalPrestaciones.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}