import { google } from "googleapis";

// Cliente Google Sheets via Service Account (somente servidor).
// Envs: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY (com \n literais),
// SPREADSHEET_ID. Erro explícito se faltar alguma.
export function getSheets() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const spreadsheetId = process.env.SPREADSHEET_ID;
  if (!email || !key || !spreadsheetId) {
    throw new Error(
      "Sheets não configurado: defina GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY e SPREADSHEET_ID.",
    );
  }
  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return { sheets: google.sheets({ version: "v4", auth }), spreadsheetId };
}
