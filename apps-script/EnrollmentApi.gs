// ════════════════════════════════════════════════════════════════
// GENERADOR DE MATRÍCULAS — Apps Script institucional
// Universidad Imperalianz
//
// Este archivo es la fuente de verdad del backend. Debe copiarse tal cual
// al editor de Apps Script del proyecto (reemplazando el Code.gs existente)
// y volver a publicarse como Web App (Implementar > Nueva implementación).
//
// Sprint 11 (Ludi Class): se agregó doPost(e) como punto de entrada HTTP
// para el frontend de React. NO se modificó la lógica de negocio existente:
// generarMatricula(), registrarAlumno(), generarPDF() y
// registrarYGenerarPDF() se conservan exactamente como estaban. doGet()
// tampoco cambió: el formulario HTML original sigue funcionando igual.
// ════════════════════════════════════════════════════════════════

// ---------- CONSTANTES GLOBALES ----------
const CONTRASENA_FIJA = "Imperalianz123";
const CAPACIDAD_GRUPO = 30;
const ID_PLANTILLA = "1JmjmZcBtfisfSIu58tmMoRI3ERog0IeNyNuVfAV2hIc";

const ABREV_LICENCIATURA = {
  "Administración": "ADM",
  "Ingeniería en Sistemas": "IS",
  "Negocios Internacionales": "NI",
  "Contabilidad": "CON",
  "Derecho": "DER",
  "Mercadotecnia": "MER",
  "Pedagogía": "PED",
  "Psicología": "PSI"
};

const LETRAS_GRUPO = ["A","B","C","D","E","F","G","H","I","J"];

// ============================================================
// TAREA 1: Configuración de la hoja
// ============================================================
function setupSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const hoja  = ss.getSheetByName("Alumnos") || ss.insertSheet("Alumnos");

  const encabezados = [
    "ID Alumno",
    "Nombre Completo",
    "Correo",
    "Teléfono",
    "Programa",
    "Modalidad/Licenciatura",
    "Periodo/Meses",
    "Fecha Ingreso",
    "Matrícula",
    "Grupo",
    "Contraseña"
  ];

  const rango = hoja.getRange(1, 1, 1, encabezados.length);
  rango.setValues([encabezados]);
  rango.setFontWeight("bold").setBackground("#1a1a2e").setFontColor("#ffffff").setHorizontalAlignment("center");
  hoja.setFrozenRows(1);
}

// ============================================================
// TAREA 2: Lógica de Matrícula e ID de Alumno
// (Núcleo del sistema — NO modificar en su lógica)
// ============================================================
function generarMatricula(datos) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName("Alumnos");
  const anio = String(new Date().getFullYear()).slice(-2);
  const programa = datos.programa.trim();
  const modalidad = datos.modalidad.trim();
  const periodo = datos.periodo ? String(datos.periodo).trim() : "";

  const ultimaFila = hoja.getLastRow();
  let registros = [];
  if (ultimaFila > 1) {
    registros = hoja.getRange(2, 1, ultimaFila - 1, 10).getValues();
  }

  function calcularLogica(filtro, tieneTopeGrupo) {
    const coincidencias = registros.filter(r => filtro(r));
    const totalActual = coincidencias.length;

    if (tieneTopeGrupo) {
      const indiceGrupo = Math.floor(totalActual / CAPACIDAD_GRUPO);
      const grupo = LETRAS_GRUPO[indiceGrupo] || "Z";
      const numEnGrupo = (totalActual % CAPACIDAD_GRUPO) + 1;
      const numeroAlumno = String(numEnGrupo).padStart(2, "0");
      return { grupo, numeroAlumno };
    } else {
      const numeroAlumno = String(totalActual + 1).padStart(2, "0");
      return { grupo: "N/A", numeroAlumno };
    }
  }

  // --- PREPA ---
  if (programa.toUpperCase() === "PREPA") {
    if (modalidad.toUpperCase() === "EXAMEN") {
      const { numeroAlumno } = calcularLogica(r => r[4].toUpperCase() === "PREPA" && r[5].toUpperCase() === "EXAMEN", false);
      return { matricula: `PREP-E${anio}${numeroAlumno}`, grupo: "Único", numeroAlumno };
    }
    if (modalidad.toUpperCase() === "CURSO") {
      const { numeroAlumno } = calcularLogica(r => r[4].toUpperCase() === "PREPA" && r[5].toUpperCase() === "CURSO" && String(r[6]) === periodo, false);
      return { matricula: `PREP-C${anio}${numeroAlumno}-${periodo}`, grupo: "Único", numeroAlumno };
    }
    if (modalidad.toUpperCase() === "ESCOLARIZADA") {
      const { grupo, numeroAlumno } = calcularLogica(r => r[4].toUpperCase() === "PREPA" && r[5].toUpperCase() === "ESCOLARIZADA", true);
      return { matricula: `PREP-ES${anio}${grupo}${numeroAlumno}`, grupo, numeroAlumno };
    }
  }

  // --- LICENCIATURA ---
  const abrev = ABREV_LICENCIATURA[programa];
  const { grupo, numeroAlumno } = calcularLogica(r => r[4] === programa && String(r[6]) === periodo, true);
  const matricula = `L-${abrev}${periodo}${anio}-${grupo}${numeroAlumno}`;
  return { matricula, grupo, numeroAlumno };
}

// ============================================================
// TAREA 4: Registro Físico
// (Núcleo del sistema — NO modificar en su lógica)
// ============================================================
function registrarAlumno(datos) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName("Alumnos");

  const infoMatricula = generarMatricula(datos);

  const nuevaFila = [
    infoMatricula.numeroAlumno,
    datos.nombreCompleto,
    datos.correo,
    datos.telefono,
    datos.programa,
    datos.modalidad,
    datos.periodo,
    new Date(),
    infoMatricula.matricula,
    infoMatricula.grupo,
    CONTRASENA_FIJA
  ];

  hoja.appendRow(nuevaFila);
  hoja.getRange(hoja.getLastRow(), 8).setNumberFormat("dd/mm/yyyy");

  return {
    nombreCompleto: datos.nombreCompleto,
    programa: datos.programa,
    grupo: infoMatricula.grupo,
    matricula: infoMatricula.matricula,
    numeroAlumno: infoMatricula.numeroAlumno
  };
}

// ============================================================
// WEB APP & PDF (Sin cambios en lógica de carta)
// (doGet y generarPDF son núcleo del sistema — NO modificar)
// ============================================================
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile("Index")
    .setTitle("Registro — Universidad Imperalianz")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function generarPDF(alumno) {
  const nombreCarpeta = "Cartas de Bienvenida";
  const carpeta = DriveApp.getFoldersByName(nombreCarpeta).hasNext() ?
                  DriveApp.getFoldersByName(nombreCarpeta).next() : DriveApp.createFolder(nombreCarpeta);

  const copiaDoc = DriveApp.getFileById(ID_PLANTILLA).makeCopy(`Carta_${alumno.nombreCompleto}`, carpeta);
  const docOpen = DocumentApp.openById(copiaDoc.getId());
  const body = docOpen.getBody();

  body.replaceText("{{nombre}}", alumno.nombreCompleto);
  body.replaceText("{{programa}}", alumno.programa);
  body.replaceText("{{grupo}}", alumno.grupo);
  body.replaceText("{{matricula}}", alumno.matricula);
  body.replaceText("{{usuario}}", alumno.matricula);
  body.replaceText("{{password}}", CONTRASENA_FIJA);

  docOpen.saveAndClose();
  const pdfBlob = copiaDoc.getAs(MimeType.PDF);
  const archivoPDF = carpeta.createFile(pdfBlob);
  archivoPDF.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  copiaDoc.setTrashed(true);

  return `https://drive.google.com/uc?export=download&id=${archivoPDF.getId()}`;
}

function registrarYGenerarPDF(datos) {
  try {
    const alumno = registrarAlumno(datos);
    const pdfUrl = generarPDF(alumno);
    return Object.assign({}, alumno, { pdfUrl: pdfUrl });
  } catch (err) {
    return { error: err.message };
  }
}

// ============================================================
// SPRINT 11 (Ludi Class): PUNTO DE ENTRADA HTTP PARA REACT
// ============================================================
// Únicamente adapta la entrada/salida de registrarYGenerarPDF() para
// peticiones POST desde el frontend. No duplica ni altera la lógica de
// negocio: usuario y contraseña temporal se derivan aquí (matrícula y
// CONTRASENA_FIJA) porque registrarYGenerarPDF() no los expone y no debe
// modificarse. doGet() arriba se conserva intacto para el formulario HTML
// original; ambos puntos de entrada coexisten.

/** Respuesta JSON uniforme, consumida por appsScriptApi.ts en React. */
function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Solicitud vacía: no se recibieron datos.");
    }

    const datos = JSON.parse(e.postData.contents);

    const camposRequeridos = ["nombreCompleto", "correo", "telefono", "programa", "modalidad", "periodo"];
    for (const campo of camposRequeridos) {
      if (datos[campo] === undefined || datos[campo] === null) {
        throw new Error("Falta el campo requerido: " + campo);
      }
    }

    const resultado = registrarYGenerarPDF(datos);

    if (resultado && resultado.error) {
      return jsonResponse_({
        success: false,
        message: "No se pudo registrar al alumno.",
        error: resultado.error
      });
    }

    const data = {
      nombreCompleto: resultado.nombreCompleto,
      matricula: resultado.matricula,
      grupo: resultado.grupo,
      numeroAlumno: resultado.numeroAlumno,
      pdfUrl: resultado.pdfUrl,
      usuario: resultado.matricula,
      contrasenaTemporal: CONTRASENA_FIJA
    };

    return jsonResponse_({
      success: true,
      message: "Alumno registrado correctamente.",
      data: data
    });
  } catch (err) {
    return jsonResponse_({
      success: false,
      message: "Ocurrió un error al procesar la solicitud.",
      error: err.message
    });
  }
}
