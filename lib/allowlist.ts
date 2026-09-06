// Allowlist de e-mails autorizados — edge-compatible (sem APIs Node).
// Fonte: env ALLOWED_EMAILS (separados por vírgula). Lista vazia = nega tudo.
export function allowedEmails(): string[] {
  return (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(email?: string | null): boolean {
  if (!email) return false;
  return allowedEmails().includes(email.toLowerCase());
}
