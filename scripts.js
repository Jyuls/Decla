const text1 = document.getElementById("titulo");
const text2 = document.getElementById("subtitulo");
const pdfinput = document.getElementById("pdfinput");
const upload = document.getElementById("upload");
const quincenasTable = document.getElementById("quincenas-table");
const totalTable = document.getElementById("total-table");
const buttons = document.getElementById("circular-buttons")
const buttonBack = document.getElementById("button-back");
const exportPdfButton = document.getElementById("export-pdf");
const exportExcelButton = document.getElementById("export-excel");

exportExcelButton.addEventListener("click", function () {
 // Obtener datos de la tabla de quincenas
 var quincenasTable = document.getElementById('quincenas-table');
 var quincenasData = [];

 for (var i = 0; i < quincenasTable.rows.length; i++) {
     var rowData = [];
     for (var j = 0; j < quincenasTable.rows[i].cells.length; j++) {
         rowData.push(quincenasTable.rows[i].cells[j].textContent);
     }
     quincenasData.push(rowData);
 }

 // Obtener datos de la tabla de totales
 var totalTable = document.getElementById('total-table');
 var totalesData = [];

 for (var i = 0; i < totalTable.rows.length; i++) {
     var rowData = [];
     for (var j = 0; j < totalTable.rows[i].cells.length; j++) {
         rowData.push(totalTable.rows[i].cells[j].textContent);
     }
     totalesData.push(rowData);
 }

 // Crear el documento Excel
 var wb = XLSX.utils.book_new();
 var ws = XLSX.utils.aoa_to_sheet([...quincenasData, [], ...totalesData]);

 // Ajustar el ancho de las columnas y el alto de las filas
 ws['!cols'] = [{ wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 15 }];
 ws['!rows'] = quincenasData.map(function () {
     return { hpt: 15 }; // Establecer la altura de las filas en puntos
 });

 // Agregar la hoja al libro
 XLSX.utils.book_append_sheet(wb, ws, 'Datos');

 // Guardar el archivo
 XLSX.writeFile(wb, 'datos.xlsx');
});


buttonBack.addEventListener("click", function() {
    text1.style.display = 'flex';
    text2.style.display = 'flex';
    pdfinput.style.display = 'flex';
    upload.style.display = 'flex';

    quincenasTable.style.display = 'none';
    totalTable.style.display = 'none';
    buttons.style.display = 'none';

    pdfinput.value = "";
    totalTable.innerHTML = "";
    quincenasTable.innerHTML = "";
}); 

exportPdfButton.addEventListener("click", function() {
    // Obtener datos de la tabla de quincenas
    var quincenasTable = document.getElementById('quincenas-table');
    var quincenasData = [];

    // Agregar encabezados
    var headerRow = [];
    for (var i = 0; i < quincenasTable.rows[0].cells.length; i++) {
        headerRow.push({ text: quincenasTable.rows[0].cells[i].textContent, style: 'tableHeader' });
    }
    quincenasData.push(headerRow);

    // Agregar datos
    for (var i = 1; i < quincenasTable.rows.length; i++) {
        var rowData = [];
        for (var j = 0; j < quincenasTable.rows[i].cells.length; j++) {
            rowData.push(quincenasTable.rows[i].cells[j].textContent);
        }
        quincenasData.push(rowData);
    }

    // Obtener datos de la tabla de totales
    var totalTable = document.getElementById('total-table');
    var totalData = [];

    // Agregar encabezados
    var totalHeaderRow = [];
    for (var i = 0; i < totalTable.rows[0].cells.length; i++) {
        totalHeaderRow.push({ text: totalTable.rows[0].cells[i].textContent, style: 'tableHeader' });
    }
    totalData.push(totalHeaderRow);

    // Agregar datos
    for (var i = 1; i < totalTable.rows.length; i++) {
        var rowData = [];
        for (var j = 0; j < totalTable.rows[i].cells.length; j++) {
            rowData.push(totalTable.rows[i].cells[j].textContent);
        }
        totalData.push(rowData);
    }

    // Crear el documento
    var docDefinition = {
        content: [
            {
                table: {
                    headerRows: 1,
                    body: quincenasData
                }
            },
            { text: '\n\n' }, // Separación entre las tablas
            {
                table: {
                    headerRows: 1,
                    body: totalData
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
});


upload.addEventListener("click", function() {
    if (pdfinput.files.length > 0) {
        // Ocultar elementos anteriores
        text1.style.display = 'none';
        text2.style.display = 'none';
        pdfinput.style.display = 'none';
        upload.style.display = 'none';

        // Mostrar nuevos elementos
        quincenasTable.style.display = 'block';
        totalTable.style.display = 'block';
        buttons.style.display = 'flex';

        let pdfDataArray = [];

        for (let i = 0; i < pdfinput.files.length; i++) {
            let reader = new FileReader();

            reader.onload = function() {
                let pdfData = new Uint8Array(reader.result);

                pdfjsLib.getDocument(pdfData).promise.then(function(pdf) {
                    let textPromises = [];
                    for (let j = 1; j <= pdf.numPages; j++) {
                        textPromises.push(pdf.getPage(j).then(function(page) {
                            return page.getTextContent().then(function(content) {
                                let pageText = "";
                                for (let k = 0; k < content.items.length; k++) {
                                    pageText += content.items[k].str + "\n";
                                }
                                return pageText.trim();
                            });
                        }));
                    }

                    Promise.all(textPromises).then(function(pages) {
                        let pdfText = pages.join("\n");

                        let data = extractData(pdfText);

                        pdfDataArray.push(data);

                        if (pdfDataArray.length === pdfinput.files.length) {
                            pdfDataArray.sort((a, b) => new Date(convertToDateFormat(a["Fecha de pago"])) - new Date(convertToDateFormat(b["Fecha de pago"])));

                            let remuneracionAnual = 0;
                            let retencionISRAanual = 0;
                            pdfDataArray.forEach(function(pdfData) {
                                let quincenaNeta = parseFloat(pdfData["Quincena Neta"].replace(/,/g, ""));
                                let isr = parseFloat(pdfData["ISR"].replace(/,/g, ""));
                                remuneracionAnual += quincenaNeta;
                                retencionISRAanual += isr;
                            });
                            fillQuincenasTable(pdfDataArray);
                            fillTotalTable(remuneracionAnual, retencionISRAanual);
                        }
                    });
                });
            };

            reader.readAsArrayBuffer(pdfinput.files[i]);
        }
    } else {
        showAlert("Error", "Primero debes cargar tus documentos");
    }
});

function showAlert(title, message) {
    alert(`${title}\n${message}`);
}

function fillQuincenasTable(pdfDataArray) {

    // Crear fila de encabezados
    const headerRow = quincenasTable.insertRow();
    for (const key in pdfDataArray[0]) {
        const cell = headerRow.insertCell();
        cell.textContent = key;
        cell.classList.add('tableHeader'); // Aplicar estilo de encabezado
    }

    pdfDataArray.forEach(function(pdfData) {
        let row = quincenasTable.insertRow(-1);
        let cellFechaPago = row.insertCell(0);
        let cellPeriodoPago = row.insertCell(1);
        let cellPercepciones = row.insertCell(2);
        let cellISR = row.insertCell(3);
        let cellQuincenaNeta = row.insertCell(4);

        // Modifica estas líneas para usar innerHTML en lugar de textContent
        cellFechaPago.innerHTML = pdfData["Fecha de pago"];
        cellPeriodoPago.innerHTML = pdfData["Periodo de pago"].join(" - ");
        cellPercepciones.innerHTML = pdfData["Percepciones"];
        cellISR.innerHTML = pdfData["ISR"];
        cellQuincenaNeta.innerHTML = pdfData["Quincena Neta"];
    });
}

function fillTotalTable(remuneracionAnual, retencionISRAanual) {

    // Eliminar filas existentes
    while (totalTable.rows.length > 0) {
        totalTable.deleteRow(0);
    }

    // Crear fila de encabezados
    const headerRow = totalTable.insertRow();
    const remuneracionCell = headerRow.insertCell();
    const retencionISRACell = headerRow.insertCell();

    remuneracionCell.textContent = 'Remuneración Anual';
    retencionISRACell.textContent = 'Retención ISR Anual';

    remuneracionCell.classList.add('tableHeader'); // Aplicar estilo de encabezado
    retencionISRACell.classList.add('tableHeader'); // Aplicar estilo de encabezado

    // Crear fila para los valores
    const valuesRow = totalTable.insertRow();
    const remuneracionValueCell = valuesRow.insertCell();
    const retencionISRValueCell = valuesRow.insertCell();

    remuneracionValueCell.textContent = remuneracionAnual.toFixed(2);
    retencionISRValueCell.textContent = retencionISRAanual.toFixed(2);
}

function extractData(text) {
    const data = {};
    data["Fecha de pago"] = extractFechaPago(text);
    data["Periodo de pago"] = extractPeriodoPago(text);
    data["Percepciones"] = extractPercepciones(text);
    data["ISR"] = extractISR(text) || "0";
    data["Quincena Neta"] = calculateQuincenaNeta(data["Percepciones"], data["ISR"]);
    return data;
}

function extractPercepciones(text) {
    const regex = /DESCUENTOS[\n\r]+([^\n\r]+)/;
    const match = text.match(regex);
    if (match && match[1]) {
        return match[1].trim();
    }
    return "";
}

function extractISR(text) {
    const regex = /IMPUESTO SOBRE LA RENTA[\n\r]+([^\n\r]+)/;
    const match = text.match(regex);
    if (match && match[1]) {
        return match[1].trim();
    }
    return "";
}

function extractFechaPago(text) {
    const regex = /NÚMERO DE SEGURIDAD SOCIAL[\n\r]+.*[\n\r]+.*[\n\r]+([^\n\r]+)/;
    const match = text.match(regex);
    if (match && match[1]) {
        return match[1].trim();
    }
    return "";
}

function extractPeriodoPago(text) {
    const regex1 = /NÚMERO DE SEGURIDAD SOCIAL[\n\r]+([^\n\r]+)/;
    const match1 = text.match(regex1);
    const regex2 = /FECHA DE PAGO[\n\r]+([^\n\r]+)/;
    const match2 = text.match(regex2);
    const periodoPago = [];

    if (match1 && match1[1]) {
        periodoPago.push(match1[1].trim());
    }

    if (match2 && match2[1]) {
        // Modificar el formato de fecha aquí
        const periodoPagoFecha = match2[1].trim().replace(/,/g, ' - ');
        periodoPago.push(periodoPagoFecha);
    }

    return periodoPago;
}



function calculateQuincenaNeta(percepciones, isr) {
    const percepcionesValue = parseFloat(percepciones.replace(/,/g, ""));
    const isrValue = parseFloat(isr.replace(/,/g, ""));
    return (percepcionesValue - isrValue).toFixed(2);
}

function convertToDateFormat(dateString) {
    const parts = dateString.split('/');
    return new Date(parts[2], parts[1] - 1, parts[0]);
}
