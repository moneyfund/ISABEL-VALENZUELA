/**
 * Client-side visibility only. Firestore and Storage security rules enforce
 * this same allowlist independently with Firebase Auth verified Google tokens.
 */
export const ADMIN_EMAILS = [
  "norvingarcia220@gmail.com",
  "valenzuela.ing120@gmail.com"
] as const;

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  return typeof email === "string"
    && ADMIN_EMAILS.some(allowed => allowed === email.trim().toLowerCase());
}
