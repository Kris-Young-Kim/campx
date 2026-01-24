import { auth, currentUser } from "@clerk/nextjs/server";

export interface ClerkAuthUser {
  id: string;
  email?: string;
  name?: string;
  image?: string;
}

export interface AuthSession {
  user: ClerkAuthUser;
}

/**
 * Get the current session (for Server Components / Server Actions / API Routes)
 */
export async function getSession(): Promise<AuthSession | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();

  if (!user) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress,
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || undefined,
      image: user.imageUrl,
    },
  };
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}
