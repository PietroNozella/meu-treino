import { google } from "googleapis";

// Normaliza a chave para tolerar formatos de colagem na Vercel:
// com/sem aspas, \n literais, \\n duplamente escapados ou quebras reais.
function normalizarChave(raw: string): string {
  let key = raw.trim();
  if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
  key = key.replace(/\\\\n/g, "\n").replace(/\\n/g, "\n");
  if (!key.includes("-----BEGIN PRIVATE KEY-----")) {
    throw new Error(
      "GOOGLE_PRIVATE_KEY inválida: confira o valor na Vercel (PEM em linha única, sem aspas).",
    );
  }
  return key;
}
// Cliente Google Sheets via Service Account (somente servidor).
// Envs: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY (com \n literais),
// SPREADSHEET_ID. Erro explícito se faltar alguma.
export function getSheets() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const spreadsheetId = process.env.SPREADSHEET_ID;
  if (!email || !rawKey || !spreadsheetId) {
    throw new Error(
      "Sheets não configurado: defina GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY e SPREADSHEET_ID.",
    );
  }
  const key = normalizarChave(rawKey);
  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return { sheets: google.sheets({ version: "v4", auth }), spreadsheetId };
}
