"use client";

// Clerk handles authentication provider at the root level (app/layout.tsx)
// This component is kept for compatibility but simply passes through children
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
