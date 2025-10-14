// Optional: set this to force the script to use a specific spreadsheet ID.
// If left blank (or left as the default placeholder) the script will use
// the spreadsheet it is bound to, which is the easiest way to deploy the
// web app from the target Google Sheet found at
// https://drive.google.com/drive/folders/1zI9Ha1fC5tsBIwEN2eLSVaLzcrmjzQFS.
const SPREADSHEET_ID = '';

const DEFAULT_SHEET_NAME = 'Quiz Responses';

const QUIZ_HEADER_ROW = ['Timestamp', 'Student Name', 'Quiz Type', 'Score', 'Question', 'Answer', 'Raw Payload'];

const ASSESSMENT_HEADER_ROW = [
  'Timestamp',
  'Assessment Title',
  'Student Name',
  'Student Email',
  'Class Group',
  'Teacher',
  'Item',
  'Response',
  'Raw Payload'
];

const SHEETS_CONFIG = {
  'Quiz Responses': {
    header: QUIZ_HEADER_ROW,
    buildRows: buildQuizRows_
  },
  'Assessment Responses': {
    header: ASSESSMENT_HEADER_ROW,
    buildRows: buildAssessmentRows_
  }
};

function doPost(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return createErrorResponse_(400, 'Missing request body');
  }

  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (error) {
    return createErrorResponse_(400, 'Invalid JSON: ' + error);
  }

  try {
    const sheetName = getTargetSheetName_(payload);
    const config = SHEETS_CONFIG[sheetName];
    if (!config) {
      throw new Error('Unsupported sheet configuration: ' + sheetName);
    }
    const sheet = getTargetSheet_(sheetName, config.header);
    const rows = config.buildRows(payload);

    if (!rows.length) {
      return createErrorResponse_(400, 'No quiz data supplied');
    }

    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, config.header.length).setValues(rows);
    return createSuccessResponse_({ rowsWritten: rows.length });
  } catch (error) {
    return createErrorResponse_(500, 'Server error: ' + error);
  }
}

function doOptions() {
  return createPreflightResponse_();
}

function getTargetSheet_(sheetName, headerRow) {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow(headerRow);
  }

  const header = sheet.getRange(1, 1, 1, headerRow.length).getValues()[0];
  if (!headersMatch_(header, headerRow)) {
    sheet.clearContents();
    sheet.appendRow(headerRow);
  }

  return sheet;
}

function getTargetSheetName_(payload) {
  const requested = (payload.sheetName || '').toString().trim();
  if (requested && SHEETS_CONFIG[requested]) {
    return requested;
  }
  return DEFAULT_SHEET_NAME;
}

function getSpreadsheet_() {
  const trimmedId = (SPREADSHEET_ID || '').trim();
  if (trimmedId && trimmedId !== 'REPLACE_WITH_SPREADSHEET_ID') {
    return SpreadsheetApp.openById(trimmedId);
  }

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) {
    throw new Error('Unable to locate target spreadsheet. Provide a SPREADSHEET_ID.');
  }
  return active;
}

function buildQuizRows_(payload) {
  const timestamp = parseTimestamp_(payload.timestamp);
  const studentName = (payload.studentName || '').trim();
  const quizType = payload.quizType || '';
  const score = payload.score || '';
  const rawPayload = JSON.stringify(payload);
  const rows = [];

  if (Array.isArray(payload.quiz) && payload.quiz.length) {
    payload.quiz.forEach(item => {
      rows.push([
        timestamp,
        studentName,
        quizType,
        score,
        item.question || '',
        item.answer || '',
        rawPayload
      ]);
    });
  } else if (Array.isArray(payload.responses) && payload.responses.length) {
    payload.responses.forEach(item => {
      rows.push([
        timestamp,
        studentName,
        quizType,
        score,
        item.question || '',
        item.answer || '',
        rawPayload
      ]);
    });
  } else {
    rows.push([timestamp, studentName, quizType, score, '', '', rawPayload]);
  }

  return rows;
}

function buildAssessmentRows_(payload) {
  const timestamp = parseTimestamp_(payload.timestamp);
  const assessmentTitle = (payload.assessmentType || '').trim();
  const studentName = (payload.studentName || '').trim();
  const studentEmail = (payload.studentEmail || '').trim();
  const classGroup = (payload.classGroup || '').trim();
  const teacher = (payload.teacher || '').trim();
  const rawPayload = JSON.stringify(payload);
  const responses = Array.isArray(payload.responses) ? payload.responses : [];
  const rows = [];

  if (responses.length) {
    responses.forEach(item => {
      rows.push([
        timestamp,
        assessmentTitle,
        studentName,
        studentEmail,
        classGroup,
        teacher,
        item.question || '',
        item.answer || '',
        rawPayload
      ]);
    });
  } else {
    rows.push([
      timestamp,
      assessmentTitle,
      studentName,
      studentEmail,
      classGroup,
      teacher,
      '',
      '',
      rawPayload
    ]);
  }

  return rows;
}

function parseTimestamp_(value) {
  if (!value) {
    return new Date();
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function headersMatch_(existing, target) {
  if (existing.length !== target.length) return false;
  for (let i = 0; i < target.length; i++) {
    if ((existing[i] || '').toString().trim() !== target[i]) {
      return false;
    }
  }
  return true;
}

function createPreflightResponse_() {
  const output = ContentService.createTextOutput('');
  output.setResponseCode(204);
  return applyCorsHeaders_(output);
}

function createSuccessResponse_(object) {
  return createJsonResponse_(200, Object.assign({ status: 'success' }, object));
}

function createErrorResponse_(statusCode, message) {
  return createJsonResponse_(statusCode, { status: 'error', message: message });
}

function createJsonResponse_(statusCode, object) {
  const output = ContentService.createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON)
    .setResponseCode(statusCode);
  return applyCorsHeaders_(output);
}

function applyCorsHeaders_(output) {
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  output.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  return output;
}
