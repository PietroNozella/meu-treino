import { withAuth } from "next-auth/middleware";
import { isEmailAllowed } from "./lib/allowlist";

// Protege todas as páginas e /api/* exceto o próprio fluxo de auth,
// login e assets estáticos. Valida a allowlist também aqui para
// revogar sessões caso o e-mail saia da lista.
export default withAuth(
  function middleware() {},
  {
    pages: { signIn: "/login" },
    callbacks: {
      authorized: ({ token }) => isEmailAllowed(token?.email),
    },
  },
);

export const config = {
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.svg|apple-icon|icon).*)"],
};
