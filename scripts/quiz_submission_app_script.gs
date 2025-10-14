// Optional: set this to force the script to use a specific spreadsheet ID.
// If left blank (or left as the default placeholder) the script will use
// the spreadsheet it is bound to, which is the easiest way to deploy the
// web app from the target Google Sheet found at
// https://drive.google.com/drive/folders/1zI9Ha1fC5tsBIwEN2eLSVaLzcrmjzQFS.
const SPREADSHEET_ID = '';
const SHEET_NAME = 'Quiz Responses';
const HEADER_ROW = ['Timestamp', 'Student Name', 'Quiz Type', 'Score', 'Question', 'Answer', 'Raw Payload'];

function doPost(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return createResponse_(400, 'Missing request body');
  }

  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (error) {
    return createResponse_(400, 'Invalid JSON: ' + error);
  }

  try {
    const sheet = getTargetSheet_();
    const rows = buildRows_(payload);

    if (!rows.length) {
      return createResponse_(400, 'No quiz data supplied');
    }

    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADER_ROW.length).setValues(rows);
    return createJsonResponse_({ status: 'success', rowsWritten: rows.length });
  } catch (error) {
    return createResponse_(500, 'Server error: ' + error);
  }
}

function getTargetSheet_() {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADER_ROW);
  }

  const header = sheet.getRange(1, 1, 1, HEADER_ROW.length).getValues()[0];
  if (!headersMatch_(header, HEADER_ROW)) {
    sheet.clearContents();
    sheet.appendRow(HEADER_ROW);
  }

  return sheet;
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

function buildRows_(payload) {
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

function createResponse_(statusCode, message) {
  return ContentService.createTextOutput(message)
    .setMimeType(ContentService.MimeType.TEXT)
    .setResponseCode(statusCode);
}

function createJsonResponse_(object) {
  return ContentService.createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON)
    .setResponseCode(200);
}
